import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionDto, SessionQueryDto } from './sessions.dto';
import { IAuthenticatedRequest } from '@app/common/types/common';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  createSession(@Body() sessionPayload: SessionDto) {
    return this.sessionsService.addOrUpdateSession(sessionPayload);
  }
  @Get()
  getSession(
    @Req() request: IAuthenticatedRequest,
    @Query() queries: SessionQueryDto,
  ) {
    return this.sessionsService.getSession(request, queries);
  }
}
