import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CLIENT_PROXY_NAMES } from './rabbitmq.constant';
import { IEvent } from './event';

@Injectable()
export class RabbitMqService {
  private readonly logger = new Logger(RabbitMqService.name);
  private readonly clientProxyMapping = {
    new_knowledge: this.trainingClient,
    delete_knowledge: this.deletionClient,
  };

  constructor(
    @Inject(CLIENT_PROXY_NAMES.NEW_KNOWLEDGE_CLIENT)
    private readonly trainingClient: ClientProxy,
    @Inject(CLIENT_PROXY_NAMES.DELETE_KNOWLEDGE_CLIENT)
    private readonly deletionClient: ClientProxy,
  ) {}

  async sendMessageToQueue(pattern: string, data: IEvent<any>): Promise<any> {
    try {
      this.logger.log(`Sending message to queue: ${pattern}`);

      return await lastValueFrom(
        this.clientProxyMapping[pattern].emit(pattern, data),
      );
    } catch (error) {
      this.logger.error(
        `Failed to send message to queue ${pattern}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
