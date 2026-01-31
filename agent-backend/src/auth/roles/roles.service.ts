import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getRoleId(roleCode: string) {
    return await this.prisma.roles.findFirst({
      where: {
        code: roleCode,
      },
      select: {
        id: true,
      },
    });
  }
}
