import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { AccountUtils } from './account.util';

@Module({
  controllers: [AccountController],
  providers: [AccountService, AccountUtils],
  exports: [AccountService],
})
export class AccountModule {}
