import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserDto } from './dtos/user.dto';
import { generateHash } from '@app/utils/crypto.util';
import { getTodaysDate } from '@app/utils/date.util';

@Injectable()
export class UserUtils {
  private readonly defaultUserSelect: Prisma.UserSelect = {
    id: true,
    name: true,
    email: true,
    isEmailVerified: true,
    account: {
      select: {
        id: true,
        name: true,
      },
    },
    role: {
      select: {
        id: true,
        code: true,
        value: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  addUser(userPayload: UserDto) {
    const { name, accountId, email, password, roleId } = userPayload;
    return this.prisma.user.create({
      data: {
        ...(accountId && { accountId }),
        ...(email && { email }),
        ...(name && { name }),
        ...(password && { password: generateHash(password) }),
        ...(roleId && { roleId }),
      },
      select: this.defaultUserSelect,
    });
  }

  updateUser(userPayload: UserDto) {
    const { id, isDeleted, name, email, password, nextLoginDate, roleId } =
      userPayload;
    const currentTimeStamp = getTodaysDate();
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        updatedAt: currentTimeStamp,
        ...(name && { name }),
        ...(email && { email }),
        ...(password && { password: generateHash(password) }),
        ...(nextLoginDate && { nextLoginDate }),
        ...(isDeleted !== undefined && { isDeleted }),
        ...(roleId && { roleId }),
      },
      select: this.defaultUserSelect,
    });
  }

  verifyUserMail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId, isDeleted: false },
      data: {
        isEmailVerified: true,
        updatedAt: getTodaysDate(),
      },
      select: this.defaultUserSelect,
    });
  }

  getUser(userPayload: {
    id?: string;
    email?: string;
    password?: string;
    skip?: number;
    limit?: number;
    userSelectFields?: Prisma.UserSelect;
  }) {
    const { id, skip, limit, email, password, userSelectFields } = userPayload;

    const selectUserFields: Prisma.UserSelect =
      userSelectFields || this.defaultUserSelect;
    if (id || (email && password)) {
      return this.prisma.user.findFirst({
        where: {
          ...(id && { id }),
          ...(email && { email }),
          ...(password && { password: generateHash(password) }),
          isDeleted: false,
        },
        select: selectUserFields,
      });
    } else {
      return this.prisma.user.findMany({
        where: {
          isDeleted: false,
        },
        select: selectUserFields,
        ...(skip !== undefined && { skip }),
        ...(limit !== undefined && { take: limit }),
      });
    }
  }
}
