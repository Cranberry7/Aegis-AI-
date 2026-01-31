import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserUtils } from './user.util';

@Module({
  controllers: [UserController],
  providers: [UserService, UserUtils],
  exports: [UserUtils, UserService],
})
export class UserModule {}
