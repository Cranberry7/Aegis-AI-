import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { DocumentStatus } from '../document.enum';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  status?: DocumentStatus;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class AddDocumentDto {
  @IsString()
  fileName: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  folder?: string;

  // TODO: This needs to change/improve, either URL or S3 info must be present
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  awsRegion?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
