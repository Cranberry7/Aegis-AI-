import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AddOrUpdateAccountDto } from './dtos/account.dto';
import { PrismaQueryDto } from '@app/common/dtos/common.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  addOrUpdateAccount(@Body() accountPayload: AddOrUpdateAccountDto) {
    return this.accountService.addOrUpdateAccount(accountPayload);
  }

  @Get(':id?')
  getAccount(
    @Param('id', new ParseUUIDPipe({ optional: true })) id?: string,
    @Query() queries?: PrismaQueryDto,
  ) {
    return this.accountService.getAccount(id, queries);
  }
}
