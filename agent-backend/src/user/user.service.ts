import { Injectable, Logger } from '@nestjs/common';
import { UserUtils } from './user.util';
import { PrismaService } from '@app/prisma/prisma.service';
import { UserDto } from './dtos/user.dto';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@app/common/constants/common.constant';
import { PrismaQueryDto } from '@app/common/dtos/common.dto';
import { BaseException } from '@app/common/classes/base-exception';
import { UserRoles } from './user.enum';
import { IUserData } from './user';
import { IAuthenticatedRequest } from '@app/common/types/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userUtil: UserUtils,
    private readonly prisma: PrismaService,
  ) {}

  async addUser(userDetails: UserDto) {
    try {
      const response = await this.userUtil.addUser(userDetails);
      this.logger.log(SUCCESS_MESSAGES.SUCCESSFUL_USER_UPSERTION);
      return response;
    } catch (error) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.FAILED_USER_UPSERTION,
        stack: error,
      });
    }
  }

  updateUser(userDetails: UserDto) {
    return this.userUtil.updateUser(userDetails);
  }

  async getUsers(
    accountId?: string,
    queries?: PrismaQueryDto,
    role?: string,
  ): Promise<IUserData> {
    const { skip, limit } = queries;
    let roleCodes = [];
    switch (role) {
      case UserRoles.ADMIN:
        roleCodes = [UserRoles.USER, UserRoles.GUEST];
        break;
      case UserRoles.SUPERADMIN:
        roleCodes = [UserRoles.ADMIN, UserRoles.USER, UserRoles.GUEST];
        break;
      default:
        roleCodes = [UserRoles.USER];
    }

    if (!accountId && role !== UserRoles.SUPERADMIN) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.MISSING_INPUT,
        message: 'Either id or accountId is required to fetch the user.',
      });
    }
    const whereClause = {
      isDeleted: false,
      role: {
        code: {
          in: roleCodes,
        },
      },
      ...(role !== UserRoles.SUPERADMIN && {
        accountId: accountId,
      }),
    };

    const numberOfRows = await this.prisma.user.count({
      where: whereClause,
    });
    const response = await this.prisma.user.findMany({
      where: whereClause,
      ...(skip !== undefined && { skip }),
      ...(limit !== undefined && { take: limit }),
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            code: true,
          },
        },
      },
    });
    return {
      numberOfRows: numberOfRows,
      rows: response,
    };
  }

  async deleteUser(request: IAuthenticatedRequest, id: string) {
    const role = request.role;
    const isAdmin = (role as UserRoles) === UserRoles.ADMIN;

    const response = await this.prisma.user.update({
      where: {
        id: id,
        ...(isAdmin && { accountId: request.accountId }),
      },
      data: {
        isDeleted: true,
      },
    });

    this.logger.log(`Deleted user for id: ${id}`);
    return response;
  }
}
