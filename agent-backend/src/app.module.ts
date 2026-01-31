import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

// Guards
import { JwtAuthGuard } from './common/guards/jwtAuthGuard';
import { RolesGuard } from './common/guards/rolesGuard';

// Core Modules
import { AsyncContextModule } from './async-context/async-context.module';
import { HttpClientModule } from '@app/http-client/http-client.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

// Services & Controllers
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { AsyncContextService } from './async-context/async-context.service';
import { WinstonCloudWatchLogger } from './common/classes/cloudwatch-logger';

// Middleware
import { RequestIdMiddleware } from './common/middlewares/request-id-tracker';

// Configuration
import { JwtModule } from '@nestjs/jwt';
import { AccountModule } from './account/account.module';
import { TrainingModule } from './training/training.module';
import { ConversationsModule } from './conversations/conversations.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    JwtModule,
    HttpClientModule,
    PrismaModule.forRoot(),
    AuthModule.forRoot(),
    AsyncContextModule.forRoot(),
    // NOTE: This is imported here as no other module imports it
    // NOTE: to make it available for API requests.
    AccountModule,
    TrainingModule,
    ConversationsModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [
    AsyncContextService,
    AppService,
    WinstonCloudWatchLogger,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
