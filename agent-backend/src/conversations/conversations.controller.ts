import { Body, Controller, Get, Post, Put, Query, Req } from '@nestjs/common';
import { ConversationDto, UpdateConversationDto } from './conversations.dto';
import { ConversationsService } from './conversations.service';
import { IAuthenticatedRequest } from '@app/common/types/common';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationService: ConversationsService) {}

  @Post()
  addConversation(@Body() conversationPayLoad: ConversationDto) {
    return this.conversationService.addConversation(conversationPayLoad);
  }

  @Get()
  getConversation(
    @Req() request: IAuthenticatedRequest,
    @Query() filters: { sessionId?: string; source?: string },
  ) {
    return this.conversationService.getConversations(request, filters);
  }

  @Put()
  updateFeedbackInConversation(@Body() updatePayLoad: UpdateConversationDto) {
    return this.conversationService.updateConversation(updatePayLoad);
  }
}
