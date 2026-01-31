import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { SessionDto, SessionQueryDto } from './sessions.dto';
import { IAuthenticatedRequest } from '@app/common/types/common';
import { UserRoles } from '@app/user/user.enum';
import { Prisma } from '@prisma/client';
import { FeedbackType } from '@app/common/enums/common.enum';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addOrUpdateSession(sessionPayload: SessionDto) {
    const { id, userId, title } = sessionPayload;
    try {
      if (id) {
        return await this.prisma.session.upsert({
          where: { id },
          update: { userId, title },
          create: { id, userId, title }, // make sure to include id in create
        });
      } else {
        return await this.prisma.session.create({
          data: { userId, title },
        });
      }
    } catch {
      this.logger.error(`Failed to create the session for id: ${id}`);
    }
  }

  async getSession(request: IAuthenticatedRequest, queries: SessionQueryDto) {
    const { skip, limit, filters } = queries;
    const role = request.role;
    const userId = request.subject;
    const accountId = request.accountId;
    if (role === UserRoles.USER) {
      return await this.prisma.session.findMany({
        where: {
          userId: userId,
        },
        ...(skip !== undefined && { skip }),
        ...(limit !== undefined && { take: limit }),
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
    try {
      let userRoles: string[] = [];

      if (role === UserRoles.ADMIN) {
        userRoles = [UserRoles.USER, UserRoles.GUEST];
      }
      if (role == UserRoles.SUPERADMIN) {
        userRoles = [UserRoles.ADMIN, UserRoles.GUEST, UserRoles.USER];
      }

      const whereClause: Prisma.SessionWhereInput = {
        AND: [
          {
            OR: [
              {
                user: {
                  name: {
                    contains: filters?.username || '',
                    mode: 'insensitive',
                  },
                },
              },
              {
                title: {
                  contains: filters?.title || '',
                  mode: 'insensitive',
                },
              },
            ],
          },
          {
            OR: [
              {
                user: {
                  role: {
                    code: {
                      in: userRoles,
                    },
                  },
                  ...(role !== UserRoles.SUPERADMIN && {
                    accountId: accountId,
                  }),
                },
              },
              {
                user: {
                  id: userId,
                },
              },
            ],
          },
        ],
        updatedAt: {
          gte: filters?.date?.from,
          lte: filters?.date?.to
            ? new Date(
                new Date(filters.date.to).setDate(
                  new Date(filters.date.to).getDate() + 1,
                ),
              )
            : undefined,
        },

        conversations: {
          some: {
            feedbackType:
              filters?.feedback && filters?.feedback !== '0'
                ? filters.feedback === '1'
                  ? FeedbackType.POSITIVE.toString()
                  : FeedbackType.NEGATIVE.toString()
                : undefined,
            isDeleted: false,
          },
        },
      };

      const response = await this.prisma.session.findMany({
        where: whereClause,
        ...(skip !== undefined && { skip }),
        ...(limit !== undefined && { take: limit }),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          conversations: {
            where: {
              isDeleted: false,
            },
            orderBy: {
              createdAt: 'asc',
            },
            select: {
              content: true,
              feedbackType: true,
              feedbackMessage: true,
              session: {
                select: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const totalRows = await this.prisma.session.count({
        where: whereClause,
      });
      const transformedResponse = response.map((item) => {
        const hasNegativeFeedback = item.conversations.some(
          (conv) => conv.feedbackType === FeedbackType.NEGATIVE,
        );
        const hasPositiveFeedback = item.conversations.some(
          (conv) => conv.feedbackType === FeedbackType.POSITIVE,
        );
        return {
          ...item,
          username: item.conversations[0].session.user.name,
          feedback: {
            positive: hasPositiveFeedback ? FeedbackType.POSITIVE : '',
            negative: hasNegativeFeedback ? FeedbackType.NEGATIVE : '',
          },
        };
      });

      return {
        numberOfRows: totalRows,
        rows: transformedResponse,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch conversations: ${error.message}`);
    }
  }
}
