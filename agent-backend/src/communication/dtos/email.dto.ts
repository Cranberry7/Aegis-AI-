import { IsEmail, IsOptional, IsString } from 'class-validator';
import { CommunicationReferenceDto } from './communication.dto';
import { Type } from 'class-transformer';

export class EmailDto {
  @IsString()
  message: string;

  @IsEmail()
  to: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @Type(() => CommunicationReferenceDto)
  reference: CommunicationReferenceDto;
}
