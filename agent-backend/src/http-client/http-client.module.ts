import { Module } from '@nestjs/common';
import { HttpClientService } from '@app/http-client/http-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}
