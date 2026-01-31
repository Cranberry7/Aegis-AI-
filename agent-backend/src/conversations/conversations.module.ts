import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { SessionsModule } from '@app/sessions/sessions.module';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [SessionsModule, UserModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
