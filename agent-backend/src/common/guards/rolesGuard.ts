import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  RequestMethod,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  ERROR_MESSAGES,
  RequestMethodStringMap,
  ROLES_PERMISSIONS,
} from '../constants/common.constant';
import { UserRoles } from '@app/user/user.enum';
import { IAuthenticatedRequest } from '../types/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/route-identifier.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  private readonly PREFIX = '/agent-backend';

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest() as IAuthenticatedRequest;
    const userId = request?.subject;
    const role = request?.role as UserRoles;
    const accountId = request?.accountId;
    const method = request.method;
    const routePath = request.route?.path || '';

    // Skip guard for public routes
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    if (!userId || !role) {
      this.logger.error(`Unauthorized User - ${userId}`);
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (!accountId) {
      this.logger.error(`Unauthorized User, no account provided - ${userId}`);
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (!routePath.startsWith(this.PREFIX)) {
      this.logger.error(`Wrong route - ${routePath}`);
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN_ACCESS);
    }
    const routeRoles: {
      pathRegex: RegExp;
      method: RequestMethod;
      allowedRoles: UserRoles[];
    }[] = ROLES_PERMISSIONS;

    const strippedPath = routePath.replace(this.PREFIX, '');

    const matchedRoute = routeRoles.find(
      (rule) =>
        rule.pathRegex.test(strippedPath) &&
        RequestMethodStringMap[rule.method] === method,
    );

    if (!matchedRoute) {
      this.logger.error(
        `No matched rule found with routePath - ${routePath} and method - ${method}`,
      );
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (!matchedRoute.allowedRoles.includes(role)) {
      this.logger.error(
        `User with id - ${userId} is not allowed to access rule with routePath - ${routePath} and method - ${method}`,
      );
      throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN_ACCESS);
    }

    this.logger.log(
      `AuditLog - userID=${userId}, role=${role}, accountId=${accountId}, method=${method}, path=${routePath}`,
    );

    return true;
  }
}
