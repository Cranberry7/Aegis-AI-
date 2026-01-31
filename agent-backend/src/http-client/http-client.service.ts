import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { BaseException } from '@app/common/classes/base-exception';
import { ERROR_MESSAGES } from '@app/common/constants/common.constant';
import { ConfigService } from '@nestjs/config';
import { ConfigVariables } from '@app/common/enums/common.enum';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async executeGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, config);
  }

  async executePost<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('POST', url, { ...config, data });
  }

  async executePut<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('PUT', url, { ...config, data });
  }

  async executeDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, config);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    this.logger.log(`${method} request to ${url}`);
    try {
      const response = await lastValueFrom(
        this.httpService
          .request<T>({
            method,
            url,
            ...config,
          })
          .pipe(
            retry(this.configService.get<number>(ConfigVariables.RETRY)),
            timeout(
              Number(this.configService.get<number>(ConfigVariables.TIMEOUT)),
            ),
          ),
      );
      return response.data;
    } catch (error) {
      throw new BaseException({
        errorCode: ERROR_MESSAGES.INVALID_REQUEST,
        message: `Invalid http request.`,
        stack: `Failed to ${method} ${url}: ${error.message}`,
      });
    }
  }
}
