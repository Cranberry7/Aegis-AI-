import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { ProcessingUtils } from './processing.utils';

@Module({
  providers: [ProcessingService, ProcessingUtils],
  exports: [ProcessingUtils],
})
export class ProcessingModule {}
