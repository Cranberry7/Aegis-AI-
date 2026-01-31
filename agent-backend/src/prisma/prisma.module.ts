import { Module, DynamicModule } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({})
export class PrismaModule {
  // NOTE: To configure this module to be made globally available without importing.
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: PrismaModule,
      providers: [PrismaService],
      exports: [PrismaService],
    };
  }
}
