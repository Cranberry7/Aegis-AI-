import { Injectable } from '@nestjs/common';
import { getTodaysDate } from 'src/utils/date.util';
import { IEvent } from './event';

@Injectable()
export class RabbitMqUtils {
  constructor() {}

  createEventObject<T>(userId: string, accountId: string, data: T): IEvent<T> {
    return {
      userId,
      accountId,
      timestamp: getTodaysDate(),
      data,
    };
  }
}
