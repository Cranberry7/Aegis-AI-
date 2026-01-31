export interface IEvent<T> {
  timestamp: string;
  userId: string;
  accountId: string;
  data: T;
}
