/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable, Inject } from '@nestjs/common';
import Axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosResponse,
  AxiosRequestConfig,
  CancelTokenSource,
} from 'axios';
import { Observable, firstValueFrom } from 'rxjs';

import { TokenCacheService } from '@/cache/services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';
import { Utils } from '@/common/utils';
import { ErrorPromise } from '@/common';

@Injectable()
export abstract class HttpAbstractService {

  public constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    protected readonly service: AxiosInstance,

    @Inject()
    protected readonly tokenCacheService: TokenCacheService,
  ) {
    this.initConfig();
    this.initInterceptor();
  }

  abstract initConfig(): void;

  abstract initInterceptor(): void;

  abstract responseResult<T>(targetRequest: Observable<AxiosResponse<T>>, respData: AxiosResponse<T>): Promise<ErrorPromise | AxiosResponse<T>>;

  public get axiosRef(): AxiosInstance {
    return this.service;
  }

  protected makeObservable<T>(
    axios: (...args: any[]) => AxiosPromise<T>,
    ...args: any[]
  ) {
    return new Observable<AxiosResponse<T>>((subscriber) => {
      let config: AxiosRequestConfig = args[args.length - 1];
      if (!config) {
        config = {};
      }

      let cancelSource: CancelTokenSource;
      if (!config.cancelToken) {
        cancelSource = Axios.CancelToken.source();
        config.cancelToken = cancelSource.token;
      }

      axios(...args)
        .then((res) => {
          subscriber.next(res);
          subscriber.complete();
        })
        .catch((err) => {
          subscriber.error(err);
        });
      return () => {
        if (config.responseType === 'stream') {
          return;
        }

        if (cancelSource) {
          cancelSource.cancel();
        }
      };
    });
  }

  get<T = any>(
    url: string,
  ): Observable<AxiosResponse<T>>;
  get<T = any, D = any>(
    url: string,
    config: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>>
  get<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>> {
    return this.makeObservable<T>(this.service.get, url, config);
  }

  post<T = any>(url: string): Promise<AxiosResponse<T>>;
  post<T = any, D = any>(
    url: string,
    data: D,
  ): Promise<AxiosResponse<T, D>>;
  post<T = any, D = any>(
    url: string,
    data: D,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T, D>>;
  async post<T = any>(
    url: string,
    data: any = {},
    config?: AxiosRequestConfig,
  ): Promise<ErrorPromise | AxiosResponse<T>> {
    const postObservable = this.makeObservable<T>(this.service.post, url, data, config);
    const [err, result] = await Utils.toPromise(firstValueFrom(postObservable))
    if (err) {
      return Promise.reject(err);
    }
    return this.responseResult(postObservable, result);
  }

}
