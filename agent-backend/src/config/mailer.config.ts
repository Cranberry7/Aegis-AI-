import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@app/common/enums/common.enum';

export const mailerConfig = async (configService: ConfigService) => ({
  transport: {
    host: configService.get<string>(ConfigVariables.EMAIL_HOST),
    auth: {
      user: configService.get<string>(ConfigVariables.EMAIL_USER),
      pass: configService.get<string>(ConfigVariables.EMAIL_PASS),
    },
  },
  defaults: {
    from: `"No Reply" <${configService.get<string>(ConfigVariables.EMAIL_USER)}>`,
  },
});
