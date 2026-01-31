import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CommunicationReferenceDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  type: string;
}
