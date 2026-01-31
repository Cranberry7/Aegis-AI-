import { BaseException } from '@app/common/classes/base-exception';
import { ERROR_MESSAGES } from '@app/common/constants/common.constant';
import { DateUnits } from '@app/common/enums/common.enum';

export function getTodaysDate() {
  return new Date().toISOString();
}

export function addToDate(date: Date, amount: number, unit: DateUnits) {
  const baseDate = date instanceof Date ? date : new Date(date);

  if (isNaN(baseDate.getTime())) {
    throw new BaseException({
      errorCode: ERROR_MESSAGES.INVALID_INPUT,
      message: `Invalid Date - ${baseDate}`,
      stack: `Date - ${baseDate}`,
    });
  }

  const newDate = new Date(baseDate);

  switch (unit.toLowerCase()) {
    case DateUnits.DAYS:
      newDate.setDate(baseDate.getDate() + amount);
      break;
    case DateUnits.MONTHS:
      newDate.setMonth(baseDate.getMonth() + amount);
      break;
    case DateUnits.YEARS:
      newDate.setFullYear(baseDate.getFullYear() + amount);
      break;
    case DateUnits.HOURS:
      newDate.setHours(baseDate.getHours() + amount);
      break;
    case DateUnits.MINUTES:
      newDate.setMinutes(baseDate.getMinutes() + amount);
      break;
    case DateUnits.SECONDS:
      newDate.setSeconds(baseDate.getSeconds() + amount);
      break;
    default:
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_INPUT,
        message: `Invalid Date unit - ${unit}`,
        stack: `Date unit - ${unit}`,
      });
  }

  return newDate.toISOString();
}

export function getTimeInMillis(amount: number, unit: DateUnits): number {
  switch (unit.toLowerCase()) {
    case DateUnits.DAYS:
      return amount * 24 * 60 * 60 * 1000;
    case DateUnits.HOURS:
      return amount * 60 * 60 * 1000;
    case DateUnits.MINUTES:
      return amount * 60 * 1000;
    case DateUnits.SECONDS:
      return amount * 1000;
    default:
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_INPUT,
        message: `Invalid Date unit - ${unit}`,
        stack: `Date unit - ${unit}`,
      });
  }
}
