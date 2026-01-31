import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TrainingInputDto } from './dtos/training.dto';
import { IAuthenticatedRequest, IUploadedFile } from '@app/common/types/common';
import { ERROR_MESSAGES } from '@app/common/constants/common.constant';
import { BaseException } from '@app/common/classes/base-exception';
import {
  SupportedResourceTypes,
  TrainingDataActions,
} from '@app/training/training.enum';
import { DocumentStatus } from '@app/document/document.enum';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@app/common/enums/common.enum';
import { S3Service } from '@app/aws/s3/s3.service';
import { QUEUES } from '@app/rabbitmq/rabbitmq.constant';
import { RabbitMqService } from '@app/rabbitmq/rabbitmq.service';
import { RabbitMqUtils } from '@app/rabbitmq/rabbitmq.util';
import { DocumentService } from '@app/document/document.service';
import { ITrainingData, ITrainingDeleteEvent } from './training';
import { IEvent } from '@app/rabbitmq/event';
import { CompressionService } from './compression/compression.service';
import { extname } from 'path';

@Injectable()
export class TrainingService {
  readonly logger = new Logger(TrainingService.name);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly rabbitMqUtils: RabbitMqUtils,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly documentService: DocumentService,
    private readonly compressionService: CompressionService,
  ) {}

  async processTrainingData(
    body: TrainingInputDto,
    request: IAuthenticatedRequest,
    files?: IUploadedFile[],
  ) {
    const resourcePayload = {
      urls: body?.urls,
      files: files,
      request: request,
    };

    const isMedia = body.isMedia;
    const userId = request.subject;
    const accountId = request.accountId;

    if (!resourcePayload?.urls?.length && !resourcePayload?.files?.length) {
      throw new BadRequestException(ERROR_MESSAGES.MISSING_URL_OR_FILE);
    }
    if (!userId || !accountId) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.FAILED_USER_RETRIEVAL,
        message: 'Failed to retrieve user from request.',
      });
    }
    const addedFilesEvent = await this.processFiles(
      files,
      userId,
      accountId,
      isMedia,
    );
    const addedUrlsEvent = await this.processURLs(
      body?.urls,
      userId,
      accountId,
      isMedia,
    );
    const events = [addedFilesEvent, addedUrlsEvent];

    await this.sendTrainingEvent(
      userId,
      accountId,
      events.filter((x) => x !== undefined),
    );
  }

  async processURLs(
    urls: string[],
    userId: string,
    accountId: string,
    isMedia: boolean,
  ) {
    if (!urls?.length) {
      return;
    }

    const content: Array<ITrainingData> = [];

    for (const url of urls || []) {
      try {
        const addedUrl = await this.documentService.addDocument(
          userId,
          accountId,
          {
            type: SupportedResourceTypes.URL,
            fileName: url,
            url,
            status: DocumentStatus.NEW,
          },
        );

        content.push({
          content: {
            resourceType: SupportedResourceTypes.URL,
            metadata: {
              url: url,
              sourceId: addedUrl.id,
              isMedia: isMedia,
            },
          },
          action: TrainingDataActions.NEW,
        });
      } catch (error) {
        this.logger.error(`Failed to process - ${url}.`, error);
      }
    }
    const response = this.rabbitMqUtils.createEventObject<ITrainingData[]>(
      userId,
      accountId,
      content,
    );
    return response;
  }

  async processFiles(
    files: IUploadedFile[],
    userId: string,
    accountId: string,
    isMedia: boolean,
  ) {
    if (!files?.length) return;

    const folderName = `${accountId}/${userId}`;
    const content: ITrainingData[] = [];

    for (const file of files) {
      try {
        const addedDocument = await this.documentService.addDocument(
          userId,
          accountId,
          {
            type: isMedia
              ? SupportedResourceTypes.MEDIA
              : SupportedResourceTypes.FILE,
            fileName: file?.originalname,
            awsRegion: this.configService.get<string>(
              ConfigVariables.AWS_REGION,
            ),
            folder: folderName,
            bucket: this.configService.get<string>(
              ConfigVariables.AWS_S3_BUCKET,
            ),
            status: DocumentStatus.NEW,
          },
        );

        try {
          //compress if video
          const compressedVideo: IUploadedFile = isMedia
            ? await this.compressionService.compressVideo(file)
            : null;

          // Release buffer memory for old file.
          if (isMedia && file.buffer) {
            file.buffer = null;
          }

          await this.s3Service.performS3Operation({
            file: isMedia ? compressedVideo : file,
            fileName: addedDocument.id,
            folder: folderName,
          });

          this.logger.log('Successfully uploaded file to S3.');
          await this.documentService.updateDocument(
            addedDocument.id,
            userId,
            accountId,
            { status: DocumentStatus.UPLOADED },
          );

          content.push({
            content: {
              resourceType: SupportedResourceTypes.FILE,
              metadata: {
                originalName: file.originalname,
                fileName: `source${extname(file?.originalname)}`,
                size: (isMedia ? compressedVideo : file)?.size,
                mimetype: file?.mimetype,
                sourceId: addedDocument?.id,
                folder: folderName,
                isMedia: isMedia,
              },
            },
            action: TrainingDataActions.NEW,
          });
        } catch (s3Error) {
          this.logger.error('Failed to upload file to S3.', s3Error);
          await this.documentService.updateDocument(
            addedDocument.id,
            userId,
            accountId,
            { status: DocumentStatus.FAILED },
          );
          throw s3Error;
        }
      } catch (error) {
        this.logger.error(`Failed to process ${file?.originalname}.`, error);
      }
    }

    return this.rabbitMqUtils.createEventObject<ITrainingData[]>(
      userId,
      accountId,
      content,
    );
  }

  async deleteTrainingData(docId: string, userId: string, accountId: string) {
    const deletedDoc = await this.documentService.deleteDocument(docId);

    // Delete from S3
    await this.s3Service.performS3Operation(
      {
        fileName: deletedDoc.id,
        folder: deletedDoc.folder,
      },
      true,
    );

    const deleteEvent: IEvent<ITrainingDeleteEvent> = {
      data: { documentId: deletedDoc.id },
      timestamp: new Date().toISOString(),
      userId,
      accountId,
    };

    // Send delete_knowledge event to RabbitMQ
    await this.rabbitMqService.sendMessageToQueue(
      QUEUES.DELETE_KNOWLEDGE,
      deleteEvent,
    );

    return;
  }

  async sendTrainingEvent(
    userId: string,
    accountId: string,
    eventPayloads: Array<IEvent<ITrainingData[]>>,
  ) {
    for (const event of eventPayloads) {
      await this.rabbitMqService.sendMessageToQueue(
        QUEUES.NEW_KNOWLEDGE,
        event,
      );

      for (let index = 0; index < event.data.length; index++) {
        const element = event.data[index].content;
        // TODO: Use bulk update
        this.documentService.updateDocument(
          element.metadata.sourceId,
          userId,
          accountId,
          { status: DocumentStatus.IN_PROGRESS },
        );
      }
    }
  }
}
