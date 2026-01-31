import { Injectable, Logger } from '@nestjs/common';
import { AccountUtils } from './account.util';
import { AddOrUpdateAccountDto } from './dtos/account.dto';
import { PrismaQueryDto } from '@app/common/dtos/common.dto';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@app/common/constants/common.constant';
import { BaseException } from '@app/common/classes/base-exception';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private readonly accountUtil: AccountUtils) {}

  async addOrUpdateAccount(accountDetails: AddOrUpdateAccountDto) {
    try {
      const response =
        await this.accountUtil.addOrUpdateAccount(accountDetails);
      this.logger.log(SUCCESS_MESSAGES.SUCCESSFUL_ACCOUNT_UPSERTION);
      return response;
    } catch (error) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.FAILED_ACCOUNT_UPSERTION,
        stack: error,
      });
    }
  }

  async getAccount(id?: string, queries?: PrismaQueryDto) {
    try {
      const response = await this.accountUtil.getAccount({
        id,
        ...queries,
      });

      if (!response) {
        throw new BaseException({
          errorCode: ERROR_MESSAGES.FAILED_ACCOUNT_RETRIEVAL,
          message: `Account with id - ${id} does not exists.`,
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAccountIdByName(name: string) {
    return this.accountUtil.getAccountIdByName(name);
  }
}
