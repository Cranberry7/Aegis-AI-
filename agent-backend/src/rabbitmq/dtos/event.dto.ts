import { ITrainingData } from '@app/training/training';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class EventDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  accountId: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @Type(() => Object)
  data?: undefined | ITrainingData;
}
