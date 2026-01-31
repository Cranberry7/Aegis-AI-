import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { UpdateDocumentDto } from './dtos/document.dto';
import { IAuthenticatedRequest } from '@app/common/types/common';
import { Prisma } from '@prisma/client';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Put(':id')
  async updateDocument(
    @Req() request: IAuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Body() documentPayload: UpdateDocumentDto,
  ) {
    const userId = request.subject;
    const accountId = request.accountId;
    return await this.documentService.updateDocument(
      id,
      userId,
      accountId,
      documentPayload,
    );
  }
  @Get()
  getAllDocuments(
    @Req() request: IAuthenticatedRequest,
    @Query()
    payload: {
      id?: string;
      skip?: number;
      limit?: number;
      orderBy?: Prisma.SortOrder;
      documentSelectFields?: Prisma.DocumentSelect;
    },
  ) {
    return this.documentService.getDocument(request, payload);
  }
}
