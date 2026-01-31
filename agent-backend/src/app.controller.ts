import { AppService } from '@app/app.service';
import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/route-identifier.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('ping')
  ping(): string {
    return this.appService.ping();
  }
}
