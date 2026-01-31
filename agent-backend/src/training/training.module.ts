import { Module } from '@nestjs/common';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { RabbitMqModule } from '@app/rabbitmq/rabbitmq.module';
import { S3Module } from '@app/aws/s3/s3.module';
import { DocumentModule } from '@app/document/document.module';
import { CompressionModule } from './compression/compression.module';

@Module({
  imports: [RabbitMqModule, S3Module, DocumentModule, CompressionModule],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
