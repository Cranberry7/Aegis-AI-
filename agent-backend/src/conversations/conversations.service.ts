import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConversationDto, UpdateConversationDto } from './conversations.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { IAuthenticatedRequest } from '@app/common/types/common';
import { UserRoles } from '@app/user/user.enum';
@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async addConversation(conversationPayLoad: ConversationDto) {
    const { id, sessionId, payload, source, isDeleted } = conversationPayLoad;

    try {
      return await this.prisma.conversation.create({
        data: {
          id: id,
          sessionId: sessionId,
          source: source,
          isDeleted: isDeleted,
          ...payload,
          videoReferences:
            payload.videoReferences?.length > 0
              ? JSON.stringify(payload.videoReferences)
              : null,
          debugSteps: payload.debugSteps ?? [],
        },
      });
    } catch {
      this.logger.error(
        `Failed to add conversation for sessionId: ${sessionId}`,
      );
    }
  }

  async getConversations(
    request: IAuthenticatedRequest,
    filters: { sessionId?: string; source?: string },
  ) {
    const { sessionId, source } = filters;

    // 1) Early guard: if they asked for a specific session, verify access
    if (sessionId) {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          userId: true,
          user: { select: { accountId: true } },
        },
      });
      if (!session) {
        throw new NotFoundException(`Session with id ${sessionId} not found`);
      }
      if (request.role !== UserRoles.SUPERADMIN) {
        if (
          request.role === UserRoles.ADMIN &&
          session.user.accountId !== request.accountId
        ) {
          throw new ForbiddenException(`Not your account's session`);
        }
        if (
          request.role !== UserRoles.ADMIN &&
          session.userId !== request.subject
        ) {
          throw new ForbiddenException(
            `You do not have access to this conversation`,
          );
        }
      }
    }

    // 2) Build the Prisma 'where' clause for listing
    const where: any = { isDeleted: false };
    if (sessionId) where.sessionId = sessionId;
    if (source) where.source = source;

    if (request.role !== UserRoles.SUPERADMIN) {
      where.session = {
        is: {
          user: { is: { accountId: request.accountId } },
          ...(request.role !== UserRoles.ADMIN && { userId: request.subject }),
        },
      };
    }
    return await this.prisma.conversation.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateConversation(updatePayload: UpdateConversationDto) {
    const id = updatePayload.id;
    const feedbackType = updatePayload.feedbackType ?? null;
    const feedbackMessage = updatePayload.feedbackMessage ?? null;
    return await this.prisma.conversation.update({
      where: {
        id: id,
      },
      data: {
        feedbackType: feedbackType,
        feedbackMessage: feedbackMessage,
      },
    });
  }
}
