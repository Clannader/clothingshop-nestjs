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
import { Observable } from 'rxjs';

import { TokenCacheService } from '@/cache/services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';

@Injectable()
export abstract class HttpAbstractService {
  public constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    protected readonly service: AxiosInstance,

    @Inject()
    protected readonly tokenCacheService: TokenCacheService,
  ) {
    this.initInterceptor();
  }

  abstract initInterceptor(): void;

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

  get<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>> {
    return this.makeObservable<T>(this.service.get, url, config);
  }

  post<T = any>(url: string): Observable<AxiosResponse<T>>;
  post<T = any, D = any>(
    url: string,
    data: D,
    config?: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>>;
  post<T = any>(
    url: string,
    data: any = {},
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.makeObservable<T>(this.service.post, url, data, config);
  }

  public request = this.service.request;
  public delete = this.service.delete;
  public head = this.service.head;
  public options = this.service.options;
  // public post = this.service.post;
  // public get = this.service.get;
  public put = this.service.put;
  public patch = this.service.patch;
  public postForm = this.service.postForm;
  public putForm = this.service.putForm;
  public patchForm = this.service.patchForm;
}
