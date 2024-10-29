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

import { HttpServiceCacheService } from '@/cache/services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';
import { ServiceOptions } from '../http.types';
import { Utils } from '@/common/utils';
import { CmsSession } from '@/common';

@Injectable()
export abstract class HttpAbstractService {
  public session: CmsSession;
  public options: ServiceOptions;

  public constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    protected readonly service: AxiosInstance,

    @Inject()
    protected readonly httpServiceCacheService: HttpServiceCacheService,
  ) {}

  initConfig(
    session: CmsSession,
    options: ServiceOptions,
    config?: AxiosRequestConfig,
  ) {
    // axios的对象是同一个,如果多次使用拦截器会把其他实现类的也add进去了
    // 使用Scope.TRANSIENT就可以每次注入都是新的对象了
    // this.service.interceptors.request.clear();
    // this.service.interceptors.response.clear();
    this.session = session;
    this.options = options;
    this.service.defaults.baseURL = config.baseURL;
    this.initInterceptor();
  }

  abstract initInterceptor(): void;

  abstract responseResult<T>(
    targetRequest: Observable<AxiosResponse<T>>,
    respData: AxiosResponse<T>,
  ): Promise<AxiosResponse<T>>;

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

  get<T = any>(url: string): Promise<AxiosResponse<T>>;
  get<T = any, D = any>(
    url: string,
    config: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<T>>;
  async get<T = any, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<AxiosResponse<T>> {
    const getObservable = this.makeObservable<T>(this.service.get, url, config);
    return this.requestToPromise(getObservable);
  }

  post<T = any>(url: string): Promise<AxiosResponse<T>>;
  post<T = any, D = any>(url: string, data: D): Promise<AxiosResponse<T, D>>;
  post<T = any, D = any>(
    url: string,
    data: D,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T, D>>;
  async post<T = any>(
    url: string,
    data: any = {},
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const postObservable = this.makeObservable<T>(
      this.service.post,
      url,
      data,
      config,
    );
    return this.requestToPromise(postObservable);
  }

  delete<T = any>(url: string): Promise<AxiosResponse<T>>;
  delete<T = any, D = any>(url: string, data: D): Promise<AxiosResponse<T, D>>;
  delete<T = any, D = any>(
    url: string,
    data: D,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T, D>>;
  async delete<T = any>(
    url: string,
    data: any = {},
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const deleteObservable = this.makeObservable<T>(
      this.service.delete,
      url,
      data,
      config,
    );
    return this.requestToPromise(deleteObservable);
  }

  put<T = any>(url: string): Promise<AxiosResponse<T>>;
  put<T = any, D = any>(url: string, data: D): Promise<AxiosResponse<T, D>>;
  put<T = any, D = any>(
    url: string,
    data: D,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T, D>>;
  async put<T = any>(
    url: string,
    data: any = {},
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const putObservable = this.makeObservable<T>(
      this.service.put,
      url,
      data,
      config,
    );
    return this.requestToPromise(putObservable);
  }

  private async requestToPromise<T>(
    targetRequest: Observable<AxiosResponse<T>>,
  ): Promise<AxiosResponse<T>> {
    const [err, result] = await Utils.toPromise(firstValueFrom(targetRequest));
    if (err) {
      return Promise.reject(err);
    }
    return this.responseResult(targetRequest, result);
  }
}
