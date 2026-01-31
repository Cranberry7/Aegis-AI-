import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SessionDto {
  @IsOptional()
  @IsString()
  id: string;
  @IsString()
  userId: string;
  @IsString()
  title: string;
}

export class SessionQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsString()
  orderBy?: Prisma.SortOrder;

  @IsOptional()
  filters?: {
    username?: string;
    title?: string;
    date?: {
      from?: Date;
      to?: Date;
    };
    feedback: string;
  };
}
