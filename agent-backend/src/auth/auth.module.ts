import { Module, DynamicModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUtil } from './auth.util';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '@app/user/user.module';
import { CommunicationModule } from '@app/communication/communication.module';
import { jwtConfig } from '@app/config/jwt.config';
import { ProcessingModule } from '@app/processing/processing.module';
import { RolesModule } from '@app/auth/roles/roles.module';
import { AccountModule } from '@app/account/account.module';

@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthModule,
      global: true,
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: jwtConfig,
        }),
        UserModule,
        CommunicationModule,
        ProcessingModule,
        RolesModule,
        AccountModule,
      ],
      controllers: [AuthController],
      providers: [AuthService, AuthUtil],
      exports: [AuthService, AuthUtil],
    };
  }
}
