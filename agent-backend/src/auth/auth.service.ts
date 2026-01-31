import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AuthUtil } from './auth.util';
import { InviteDto, LoginDto } from './dtos/auth.dto';
import { ERROR_MESSAGES } from '@app/common/constants/common.constant';
import { IUploadedFile } from '@app/common/types/common';
import { BaseException } from '@app/common/classes/base-exception';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authUtil: AuthUtil) {}

  logIn(loginPayload: LoginDto, response: Response) {
    return this.authUtil.logIn(loginPayload, response);
  }

  authenticateUser(token?: string) {
    if (!token)
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_TOKEN,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    return this.authUtil.authenticateUser(token);
  }

  async verifyEmail(verificationToken: string) {
    if (!verificationToken)
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_URL,
      });

    return this.authUtil.verifyUserByEmailVerification(verificationToken);
  }

  async inviteUsers(
    accountId: string,
    invitePayload: InviteDto,
    file?: IUploadedFile,
  ) {
    if (!accountId)
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_INPUT,
      });

    let response = undefined;

    if (invitePayload?.bulk || false) {
      response = await this.authUtil.inviteUsersInBulk(accountId, file);
    } else {
      response = await this.authUtil.inviteIndividualUser(
        invitePayload?.userDetails,
        accountId,
      );
    }

    if (!response) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_INPUT,
      });
    }

    return response;
  }
}
