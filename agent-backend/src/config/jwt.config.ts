import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigVariables } from '@app/common/enums/common.enum';

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get<string>(ConfigVariables.JWT_SECRET),
  signOptions: {
    expiresIn: configService.get<string>(ConfigVariables.JWT_EXPIRY),
  },
});
