import {
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dtos/auth.dto';
import { IGetUserRecord, IInviteUserResponse } from './auth';
import { UserUtils } from '@app/user/user.util';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@app/common/constants/common.constant';
import { EmailService } from '@app/communication/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConfigVariables,
  DateUnits,
  Environments,
  Scope,
  Services,
} from '@app/common/enums/common.enum';
import { getDomainByEnv, getProtocolByEnv } from '@app/utils/network.util';
import {
  addToDate,
  getTimeInMillis,
  getTodaysDate,
} from '@app/utils/date.util';
import { InviteUserStatus } from './auth.enum';
import { IUploadedFile } from '@app/common/types/common';
import { ProcessingUtils } from '@app/processing/processing.utils';
import { Prisma } from '@prisma/client';
import { BaseException } from '@app/common/classes/base-exception';
import { Response } from 'express';
import { RolesService } from '@app/auth/roles/roles.service';
import { AccountService } from '@app/account/account.service';

@Injectable()
export class AuthUtil {
  private readonly logger = new Logger(AuthUtil.name);
  private readonly appName: string;
  private readonly jwtSecret: string;
  private readonly userNextLoginExpiryTime: number;
  private readonly userNextLoginExpiryTimeUnit: DateUnits;

  constructor(
    private readonly userUtil: UserUtils,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly processingUtil: ProcessingUtils,
    private readonly roleService: RolesService,
    private readonly accountService: AccountService,
  ) {
    this.appName = this.configService.get<string>(ConfigVariables.SERVICE_NAME);
    this.jwtSecret = this.configService.get<string>(ConfigVariables.JWT_SECRET);
    this.userNextLoginExpiryTime = this.configService.get<number>(
      ConfigVariables.USER_LOGIN_EXPIRY,
    );
    this.userNextLoginExpiryTimeUnit = this.configService.get<DateUnits>(
      ConfigVariables.USER_LOGIN_EXPIRY_UNIT,
    );
  }

  async authenticateUser(token: string) {
    const decodedJwtPayload = this.jwtService.verify(token, {
      secret: this.jwtSecret,
    });

    if (!decodedJwtPayload?.subject) {
      this.logger.error(
        `False JWT token - ${JSON.stringify(decodedJwtPayload)}`,
      );
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_LOGIN_CREDENTIALS,
        message: 'Invalid Token',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const user = (await this.userUtil.getUser({
      id: decodedJwtPayload.subject,
    })) as IGetUserRecord;

    if (!user?.id) {
      this.logger.error(
        `User Not found for jwt token - ${decodedJwtPayload.subject}`,
      );
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_LOGIN_CREDENTIALS,
        message: 'Invalid Token',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    return user;
  }

  async logIn(loginPayload: LoginDto, response: Response) {
    const { email, password } = loginPayload;

    const user = (await this.userUtil.getUser({
      email,
      password,
    })) as IGetUserRecord;

    if (!user?.id) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_LOGIN_CREDENTIALS,
        message: 'Invalid login payload.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (!user.isEmailVerified) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.NOT_VERIFIED_USER,
        message: 'Email not verified.',
        stack: JSON.stringify(loginPayload),
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const currentTimeStamp = getTodaysDate();
    const nextLoginDate = addToDate(
      new Date(currentTimeStamp),
      Number(this.userNextLoginExpiryTime),
      this.userNextLoginExpiryTimeUnit,
    );

    await this.userUtil.updateUser({
      accountId: user.account.id,
      email: user.email,
      nextLoginDate,
      id: user.id,
    });

    const token = this.generateVerificationToken(user);

    // Set secured cookie for token
    response.cookie('token', token, {
      httpOnly: true,
      secure:
        this.configService.get<string>(ConfigVariables.ENVIRONMENT) ===
        Environments.PROD,
      sameSite: 'strict',
      maxAge: getTimeInMillis(
        Number(this.userNextLoginExpiryTime),
        this.userNextLoginExpiryTimeUnit,
      ),
      path: '/',
    });

    // Set public cookie for session
    response.cookie('session', 'true', {
      httpOnly: false,
      secure:
        this.configService.get<string>(ConfigVariables.ENVIRONMENT) ===
        Environments.PROD,
      sameSite: 'strict',
      path: '/',
    });

    this.logger.log(`Successful User Login, id - ${user.id}`);
    return user;
  }

  async verifyUserByEmailVerification(
    token: string,
  ): Promise<{ verificationStatus: string }> {
    const jwtPayload = this.jwtService.verify(token, {
      secret: this.jwtSecret,
    });

    if (!jwtPayload?.subject) {
      throw new UnauthorizedException('Invalid token: Missing subject');
    }

    const userSelectFields: Prisma.UserSelect = {
      id: true,
      isEmailVerified: true,
      name: true,
      email: true,
      account: {
        select: {
          id: true,
          name: true,
        },
      },
    };

    const user = (await this.userUtil.getUser({
      id: jwtPayload.subject,
      userSelectFields,
    })) as IGetUserRecord;

    if (!user) {
      throw new UnauthorizedException('User not found for the provided token');
    }

    if (user?.isEmailVerified) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.ALREADY_VERIFIED_USER,
        message: 'User already verified.',
      });
    }

    await this.userUtil.verifyUserMail(user.id);

    this.logger.log('User verification completed.');

    return {
      verificationStatus: 'User verification completed.',
    };
  }

  async inviteIndividualUser(
    userPayload: SignupDto,
    accountId: string,
  ): Promise<IInviteUserResponse[]> {
    if (!userPayload) return;
    const { email, name, role, accountName, password } = userPayload;

    const existingUser = await this.userUtil.getUser({ email, password });
    const userRole = await this.roleService.getRoleId(role);
    let requiredAccountId = '';
    if (accountName) {
      requiredAccountId =
        await this.accountService.getAccountIdByName(accountName);
    } else {
      requiredAccountId = accountId;
    }

    if (existingUser) {
      return [
        {
          email: email,
          status: InviteUserStatus.FAILED,
          message: 'User already exists.',
        },
      ];
    }

    let invitedUser = null;
    try {
      invitedUser = await this.userUtil.addUser({
        accountId: requiredAccountId,
        email,
        roleId: userRole.id,
        ...(name && { name }),
        ...(password && { password }),
      });
    } catch (error) {
      this.logger.error(
        ERROR_MESSAGES.FAILED_USER_UPSERTION,
        { useEmail: email },
        error,
      );
      return [
        {
          email: email,
          status: InviteUserStatus.FAILED,
          message: 'Verification failed.',
        },
      ];
    }

    this.logger.log(
      `${SUCCESS_MESSAGES.SUCCESSFUL_USER_UPSERTION} - ${invitedUser.id}`,
    );

    const verificationToken = this.generateVerificationToken(invitedUser);
    const verificationLink = this.generateVerificationLink(verificationToken);

    this.emailService.sendMail({
      message: `<p>Hello ${name},</p><br/><div>Kindly click <a href="${verificationLink}">here</a> to complete your email verification.</div><br/><p>Best regards,</p><p>${this.appName}</p>`,
      to: email,
      subject: `Action Required: Confirm Your Email for ${this.appName}`,
      reference: {
        id: invitedUser.id,
        type: 'user',
      },
    });

    return [
      {
        email: email,
        status: InviteUserStatus.COMPLETED,
        message: 'Verification email sent to user.',
      },
    ];
  }

  async inviteUsersInBulk(
    accountId: string,
    file?: IUploadedFile,
  ): Promise<IInviteUserResponse[]> {
    if (!file || !file?.buffer)
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_INPUT,
        message: 'Invalid file buffer.',
      });

    const users = await this.processingUtil.parseCSVFile(file?.buffer);

    const response: IInviteUserResponse[] = [];
    for (const [index, user] of users.entries() || []) {
      if (!user?.email) {
        response.push({
          email: undefined,
          message: `line number ${index + 1} has no email.`,
          status: InviteUserStatus.FAILED,
        });
        continue;
      }
      const upsertedUserResponse = await this.inviteIndividualUser(
        user,
        accountId,
      );
      response.push(...upsertedUserResponse);
    }
    return response;
  }

  generateVerificationToken(user: IGetUserRecord): string {
    const token = this.jwtService.sign(
      {
        subject: user.id,
        scope: Scope.USER,
        role: user.role.code,
        accountId: user.account.id,
        issuer: Services.AGENT_BACKEND,
        audience: Services.AGENT_BACKEND,
      },
      {
        secret: this.jwtSecret,
        expiresIn: this.configService.get<string>(ConfigVariables.JWT_EXPIRY),
      },
    );

    return token;
  }

  generateVerificationLink(verificationToken: string) {
    return `${getProtocolByEnv()}://${getDomainByEnv()}/agent-backend/auth/verify-email?token=${verificationToken}`;
  }
}
