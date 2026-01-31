import { Injectable } from '@nestjs/common';
import { AddDocumentDto, UpdateDocumentDto } from './dtos/document.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@app/prisma/prisma.service';
import { BaseException } from '@app/common/classes/base-exception';
import { ERROR_MESSAGES } from '@app/common/constants/common.constant';
import { IAuthenticatedRequest } from '@app/common/types/common';
import { UserRoles } from '@app/user/user.enum';

@Injectable()
export class DocumentService {
  private readonly defaultDocumentSelectFields: Prisma.DocumentSelect = {};

  constructor(private readonly prisma: PrismaService) {
    this.defaultDocumentSelectFields = {
      fileName: true,
      id: true,
      userId: true,
      accountId: true,
      folder: true,
      type: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  addDocument(
    userId: string,
    accountId: string,
    documentPayload: AddDocumentDto,
  ) {
    return this.prisma.document.create({
      data: {
        accountId,
        userId,
        ...documentPayload,
      } as Prisma.DocumentUncheckedCreateInput,
      select: this.defaultDocumentSelectFields,
    });
  }

  async updateDocument(
    docId: string,
    userId: string,
    accountId: string,
    documentPayload: UpdateDocumentDto,
  ) {
    const doc = await this.prisma.document.findFirst({
      where: { id: docId },
    });

    // TODO: Improve this validation and add more throughout the code
    if (!doc) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.DOCUMENT_DOES_NOT_EXIST,
      });
    }

    return this.prisma.document.update({
      where: {
        id: docId,
        isDeleted: false,
        accountId: accountId,
        userId: userId,
      },
      data: {
        ...documentPayload,
        ...(documentPayload?.isDeleted !== undefined && {
          isDeleted: documentPayload.isDeleted,
        }),
      },
      select: this.defaultDocumentSelectFields,
    });
  }

  async getDocument(
    request: IAuthenticatedRequest,
    payload: {
      id?: string;
      skip?: number;
      limit?: number;
      orderBy?: Prisma.SortOrder;
      documentSelectFields?: Prisma.DocumentSelect;
    },
  ) {
    const { id, skip, limit, documentSelectFields, orderBy } = payload;
    const selectDocumentFields: Prisma.DocumentSelect =
      documentSelectFields || this.defaultDocumentSelectFields;

    const role = request.role;
    const accountId = request.accountId;

    if (id) {
      return this.prisma.document.findFirst({
        where: {
          ...(id && { id }),
          isDeleted: false,
        },
        select: selectDocumentFields,
      });
    } else {
      const documents = await this.prisma.document.findMany({
        where: {
          user: {
            role: {
              code: {
                in:
                  role === UserRoles.SUPERADMIN
                    ? [UserRoles.ADMIN, UserRoles.SUPERADMIN]
                    : [UserRoles.ADMIN],
              },
            },
          },
          ...(role !== UserRoles.SUPERADMIN && { accountId }),
          isDeleted: false,
        },
        select: {
          ...selectDocumentFields,
          account: {
            select: {
              name: true,
            },
          },
        },
        skip: skip !== undefined ? Number(skip) : undefined,
        take: limit !== undefined ? Number(limit) : undefined,
        orderBy: { updatedAt: orderBy || Prisma.SortOrder.desc },
      });
      const numberOfRows = await this.prisma.document.count({
        where: {
          isDeleted: false,
        },
      });
      return {
        numberOfRows: numberOfRows,
        rows: documents,
      };
    }
  }

  async deleteDocument(docId: string) {
    const doc = await this.prisma.document.findFirst({
      where: {
        id: docId,
        isDeleted: false,
      },
    });

    if (!doc) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.DOCUMENT_DOES_NOT_EXIST,
      });
    }

    return this.prisma.document.update({
      where: {
        id: docId,
      },
      data: {
        isDeleted: true,
      },
      select: this.defaultDocumentSelectFields,
    });
  }
}
