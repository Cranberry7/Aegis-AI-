import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/route-identifier.decorator';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@app/common/enums/common.enum';
import { IAuthenticatedRequest } from '../types/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const authHeader = request?.cookies?.token;

    if (!authHeader) {
      return false;
    }

    try {
      const decodedJwtToken = this.jwtService.verify(authHeader, {
        secret: this.configService.get<string>(ConfigVariables.JWT_SECRET),
      });

      // BREAKPOINT
      request.subject = decodedJwtToken.subject;
      request.role = decodedJwtToken.role;
      request.accountId = decodedJwtToken.accountId;

      if (!decodedJwtToken.subject || !decodedJwtToken.role) {
        this.logger.error('Missing user information. Validation Failed.');
        return false;
      }

      if (!decodedJwtToken.accountId) {
        this.logger.error('Missing account information. Validation Failed.');

        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Error while decoding JWT token -`, error);
      return false;
    }
  }
}
