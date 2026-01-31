import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class AsyncContextService {
  private asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

  run(callback: () => void, initialData = {}) {
    const store = new Map(Object.entries(initialData));
    this.asyncLocalStorage.run(store, callback);
  }

  set(key: string, value: any) {
    const store = this.asyncLocalStorage.getStore();
    if (store) store.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.asyncLocalStorage.getStore()?.get(key);
  }
}
