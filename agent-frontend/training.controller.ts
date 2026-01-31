import {
  Body,
  Controller,
  Optional,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IAuthenticatedRequest, IUploadedFile } from '@app/common/types/common';
import { FileValidationInterceptor } from '@app/common/interceptors/resource.interceptor';

import {
  TRAINING_MATERIAL_ALLOWED_FILE_NUMBER,
  TRAINING_MATERIAL_FILE_MAX_ALLOWED_SIZE,
  TRAINING_MATERIAL_SUPPORTED_FILE_TYPES,
} from './training.constant';
import { TrainingInputDto } from './dtos/training.dto';
import { TrainingService } from './training.service';

@Controller('train')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('resource') // TODO: Change it to accept URLs and files separately, diff endpoints
  @UseInterceptors(
    FilesInterceptor('files', TRAINING_MATERIAL_ALLOWED_FILE_NUMBER),
    new FileValidationInterceptor({
      maxSize: TRAINING_MATERIAL_FILE_MAX_ALLOWED_SIZE,
      supportedFileTypes: TRAINING_MATERIAL_SUPPORTED_FILE_TYPES,
    }),
  )
  async processInput(
    @Req() request: IAuthenticatedRequest,
    @Body() trainingResourcesPayload?: TrainingInputDto,
    @Optional()
    @UploadedFiles()
    files?: IUploadedFile[],
  ) {
    const response = this.trainingService.processTrainingData(
      trainingResourcesPayload,
      request,
      files,
    );
    return response;
  }
}
