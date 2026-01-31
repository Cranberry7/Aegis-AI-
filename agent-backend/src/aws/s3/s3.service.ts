import { ConfigVariables } from '@app/common/enums/common.enum';
import { ERROR_MESSAGES } from '@app/common/constants/common.constant';
import { IUploadedFile } from '@app/common/types/common';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly awsRegion: string;

  constructor(private readonly configService: ConfigService) {
    this.awsRegion = this.configService.get<string>(ConfigVariables.AWS_REGION);
    this.s3Client = new S3Client({
      region: this.awsRegion,
      credentials: {
        accessKeyId: this.configService.get<string>(
          ConfigVariables.AWS_ACCESS_KEY_ID,
        ),
        secretAccessKey: this.configService.get<string>(
          ConfigVariables.AWS_SECRET_ACCESS_KEY,
        ),
      },
    });
    this.bucketName = this.configService.get<string>(
      ConfigVariables.AWS_S3_BUCKET,
    );
  }

  performS3Operation(
    metadata: {
      file?: IUploadedFile;
      fileName: string;
      folder: string;
    },
    isDeleted?: boolean,
  ) {
    const { file, fileName, folder } = metadata;
    if (isDeleted) return this.deleteFile(fileName, folder);

    if (file) {
      return this.uploadFile(file, fileName, folder);
    }
  }

  private async uploadFile(
    file: IUploadedFile,
    fileName: string,
    folder?: string,
  ) {
    const extension = extname(file.originalname);
    const fileKey = `${folder}/${fileName}/source${extension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file?.buffer || '',
        ContentType: file?.mimetype,
      });

      await this.s3Client.send(command);
      this.logger.log(
        `${fileName} is uploaded successfully to folder ${folder}!`,
      );
      return {
        bucketName: this.bucketName,
        url: `https://s3.${this.awsRegion}.amazonaws.com/${this.bucketName}/${fileKey}`,
        region: this.awsRegion,
        fileName,
        folder,
      };
    } catch (error) {
      this.logger.error(ERROR_MESSAGES.S3_UPLOAD_ERROR, error);
      throw error;
    }
  }

  private async deleteFile(fileName: string, folder?: string) {
    const prefix = folder ? `${folder}/${fileName}` : fileName;

    try {
      // First, list all objects with the prefix
      // Need to list all files inside folder to delete contents of folder
      const listedObjects = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
        }),
      );

      const objectsToDelete =
        listedObjects.Contents?.map((object) => ({
          Key: object.Key,
        })) ?? [];

      // If nothing was found, try to delete as a single object (maybe it's a standalone file)
      if (objectsToDelete.length === 0) {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: prefix,
        });

        await this.s3Client.send(command);
        this.logger.log(
          `${fileName} from folder ${folder} deleted as a single file.`,
        );
      } else {
        // Delete all matching objects
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: objectsToDelete,
            Quiet: false,
          },
        });

        await this.s3Client.send(deleteCommand);
        this.logger.log(
          `${fileName} from folder ${folder} and its contents deleted successfully.`,
        );
      }

      return {
        bucketName: this.bucketName,
        fileName,
        folder,
      };
    } catch (error) {
      this.logger.error(ERROR_MESSAGES.S3_DELETION_ERROR, error);
      throw error;
    }
  }
}
