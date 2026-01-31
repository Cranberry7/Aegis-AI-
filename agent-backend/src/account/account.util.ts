import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AddOrUpdateAccountDto } from './dtos/account.dto';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class AccountUtils {
  constructor(private readonly prisma: PrismaService) {}

  addOrUpdateAccount(accountDetails: AddOrUpdateAccountDto) {
    // FIXME:
    // This will create a new org with same name again and again when -
    // 1. Existing one isDeleted: true
    // 2. Request to create new one with isDeleted: true (should check before)
    // 3. Creating the account with isDeleted: true, always create a new account with isDeleted: false

    const { id, isDeleted, name } = accountDetails;

    return this.prisma.account.upsert({
      where: { id: id || uuid(), isDeleted: false },
      create: { name },
      update: {
        ...(name && { name }),
        ...(isDeleted !== undefined && { isDeleted }),
      },
      select: { id: true },
    });
  }

  getAccount(accountPayload: { id?: string; skip?: number; limit?: number }) {
    const { id, skip, limit } = accountPayload;
    const selectAccountFields: Prisma.AccountSelect = {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    };

    if (id) {
      return this.prisma.account.findFirst({
        where: { id, isDeleted: false },
        select: selectAccountFields,
      });
    } else {
      return this.prisma.account.findMany({
        where: { id, isDeleted: false },
        select: selectAccountFields,
        ...(skip !== undefined && { skip }),
        ...(limit !== undefined && { take: limit }),
      });
    }
  }

  async getAccountIdByName(name: string) {
    const response = await this.prisma.account.findFirst({
      where: {
        name: name,
      },
    });
    return response.id;
  }
}
