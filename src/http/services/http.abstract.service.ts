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
  InternalAxiosRequestConfig,
} from 'axios';
import { Observable, firstValueFrom } from 'rxjs';

import { HttpServiceCacheService } from '@/cache/services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';
import { ServiceOptions } from '../http.types';
import { Utils } from '@/common/utils';
import { CmsSession } from '@/common';

@Injectable()
export abstract class HttpAbstractService {
  protected session: CmsSession;
  protected options: ServiceOptions;

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
    this.service.defaults.proxy = config.proxy;
    this.service.interceptors.request.clear();
    this.service.interceptors.response.clear();
    this.initGlobalInterceptor();
    this.initInterceptor();
  }

  private initGlobalInterceptor(): void {
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config.fetchOptions = {
          startTime: Date.now(),
        };
        return config;
      },
    );
    this.service.interceptors.response.use(
      (response) => {
        console.log(
          response.config.baseURL +
            response.config.url +
            '耗时: ' +
            (Date.now() - response.config.fetchOptions.startTime) +
            'ms',
        );
        return Promise.resolve(response);
      },
      (error) => {
        // 如果错误也需要计算耗时
        console.log(Date.now() - error.config.fetchOptions.startTime);
        return Promise.reject(error);
      },
    );
  }

  protected abstract initInterceptor(): void;

  protected abstract responseResult<T>(
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
      // 必须传3个参数,原因在这里,否则这里截取的参数后,调用cancelToken会报错
      // 暂时懒得修改
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
    // 真是有点神坑啊,使用makeObservable方法时必须传3个参数以上,否则底层报错,也就是使用get方法,没有参数也传一个{}
    // 估计其他方法也类似
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

  protected async requestToPromise<T>(
    targetRequest: Observable<AxiosResponse<T>>,
  ): Promise<AxiosResponse<T>> {
    const [err, result] = await Utils.toPromise(firstValueFrom(targetRequest));
    if (err) {
      return Promise.reject(err);
    }
    return this.responseResult(targetRequest, result);
  }
}
