import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ConversationPayloadDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  debugSteps: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VideoReferenceDto)
  videoReferences?: VideoReferenceDto[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sourceIds?: string[];
}

export class ConversationDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsString()
  sessionId: string;

  @ValidateNested()
  @Type(() => ConversationPayloadDto)
  payload: ConversationPayloadDto;

  @IsString()
  source: string;

  @IsOptional()
  isDeleted: boolean;
}

export class VideoReferenceDto {
  @IsString()
  url: string;
  @IsString()
  title: string;
  @IsArray()
  timeRange: [number, number];

  @IsOptional()
  @IsString()
  youtubeId: string;
}

export class UpdateConversationDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  feedbackType: string;

  @IsOptional()
  @IsString()
  feedbackMessage: string;
}
