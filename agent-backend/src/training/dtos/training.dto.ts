import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class TrainingInputDto {
  @IsOptional()
  @IsArray()
  @IsUrl(
    {
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['http', 'https'],
    },
    { each: true },
  )
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value).map((url: string) => url.trim());
      } catch {
        return undefined;
      }
    }
    if (Array.isArray(value)) {
      return value.map((url) => (typeof url === 'string' ? url.trim() : url));
    }
    return undefined;
  })
  urls?: string[];
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isMedia: boolean;
}
