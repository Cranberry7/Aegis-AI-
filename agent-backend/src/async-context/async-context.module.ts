import { Module, DynamicModule } from '@nestjs/common';
import { AsyncContextService } from './async-context.service';

@Module({})
export class AsyncContextModule {
  static forRoot(): DynamicModule {
    return {
      module: AsyncContextModule,
      providers: [AsyncContextService],
      exports: [AsyncContextService],
      global: true,
    };
  }
}
