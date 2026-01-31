import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Put,
  Delete,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { PrismaQueryDto } from '@app/common/dtos/common.dto';
import { IAuthenticatedRequest } from '@app/common/types/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  addUser(@Body() userPayload: UserDto) {
    return this.userService.addUser(userPayload);
  }

  @Put()
  updateUser(@Body() userPayload: UserDto) {
    return this.userService.updateUser(userPayload);
  }

  @Get()
  getUserByAccount(
    @Req() request: IAuthenticatedRequest,
    @Query() queries?: PrismaQueryDto,
  ) {
    const role = request.role;
    const accountId = request.accountId;
    return this.userService.getUsers(accountId, queries, role);
  }

  @Delete(':id')
  deleteUser(
    @Req() request: IAuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.userService.deleteUser(request, id);
  }
}
