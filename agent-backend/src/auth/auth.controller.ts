import {
  Body,
  Controller,
  Get,
  Logger,
  Optional,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { InviteDto, LoginDto } from './dtos/auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from '@app/common/interceptors/resource.interceptor';

import { IUploadedFile } from '@app/common/types/common';
import { Request, Response } from 'express';
import { SUCCESS_MESSAGES } from '@app/common/constants/common.constant';
import { Public } from '@app/common/decorators/route-identifier.decorator';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@app/common/enums/common.enum';
import { IAuthenticatedRequest } from '@app/common/types/common';
import { Environments } from '@app/common/enums/common.enum';
import {
  INVITE_USERS_FILE_MAX_ALLOWED_SIZE,
  INVITE_USERS_SUPPORTED_FILE_TYPES,
} from './auth.constants';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  authenticateUser(@Req() request: Request) {
    const token = request?.cookies?.token;
    return this.authService.authenticateUser(token);
  }

  @Public()
  @Post('login')
  loginUser(
    @Body() loginPayload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logIn(loginPayload, response);
  }
  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() response: Response) {
    const result = await this.authService.verifyEmail(token);
    if (result.verificationStatus) {
      // redirect user to login screen after successful verification
      return response.redirect(
        this.configService.get<string>(ConfigVariables.FRONTEND_BASE_URL) +
          '/login',
      );
    }
    return result;
  }

  @Post('logout')
  logout(
    @Res({ passthrough: true }) res: Response,
    @Req() request: IAuthenticatedRequest,
  ) {
    // Clear secured auth token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure:
        this.configService.get<string>(ConfigVariables.ENVIRONMENT) ===
        Environments.PROD,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    // Clear public session cookie
    res.clearCookie('session', {
      httpOnly: false,
      secure:
        this.configService.get<string>(ConfigVariables.ENVIRONMENT) ===
        Environments.PROD,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    this.logger.log(`Successful User Logout, id - ${request.subject}`);

    return {
      message: SUCCESS_MESSAGES.SUCCESSFUL_LOGOUT,
    };
  }

  @Post('invite')
  @UseInterceptors(
    FileInterceptor('file'),
    new FileValidationInterceptor({
      maxSize: INVITE_USERS_FILE_MAX_ALLOWED_SIZE,
      supportedFileTypes: INVITE_USERS_SUPPORTED_FILE_TYPES,
    }),
  )
  inviteUser(
    @Req() request: IAuthenticatedRequest,
    @Body() invitePayload: InviteDto,
    @Optional()
    @UploadedFile()
    file?: IUploadedFile,
  ) {
    const accountId = request.accountId;
    return this.authService.inviteUsers(accountId, invitePayload, file);
  }
}
