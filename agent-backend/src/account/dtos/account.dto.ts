import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddOrUpdateAccountDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
