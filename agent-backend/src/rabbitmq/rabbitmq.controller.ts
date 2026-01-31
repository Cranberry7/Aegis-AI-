import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DocumentService } from '@app/document/document.service';
import { QUEUES } from './rabbitmq.constant';
import { EventDto } from './dtos/event.dto';
import { DocumentStatus } from '@app/document/document.enum';

@Controller()
export class RabbitmqController {
  private readonly logger = new Logger(RabbitmqController.name);

  constructor(private readonly documentService: DocumentService) {}

  @MessagePattern(QUEUES.COMPLETE_TRAINING)
  async processMessageFromCompletedTrainingQueue(
    @Payload() eventData: EventDto,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`Message received from queue: ${context.getPattern()}`);

    // Update the status of the document
    await this.documentService.updateDocument(
      eventData.data.content.sourceId,
      eventData.userId,
      eventData.accountId,
      { status: eventData.data.content?.action || DocumentStatus.FAILED },
    );
  }
}
