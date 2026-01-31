import { AsyncContextService } from '@app/async-context/async-context.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly asyncContext: AsyncContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuidv4();

    this.asyncContext.run(() => {
      this.asyncContext.set('requestId', requestId);
      res.setHeader('X-Request-Id', requestId);
      next();
    });
  }
}
