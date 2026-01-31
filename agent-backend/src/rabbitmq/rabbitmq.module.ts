import { Module } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';
import { RabbitmqController } from './rabbitmq.controller';
import { ClientsModule } from '@nestjs/microservices';
import { DocumentModule } from '@app/document/document.module';
import { getRabbitMQConfig } from '@app/config/rabbit.config';
import { RabbitMqUtils } from './rabbitmq.util';

@Module({
  imports: [ClientsModule.registerAsync(getRabbitMQConfig()), DocumentModule],
  controllers: [RabbitmqController],
  providers: [RabbitMqService, RabbitMqUtils],
  exports: [RabbitMqService, RabbitMqUtils],
})
export class RabbitMqModule {}
