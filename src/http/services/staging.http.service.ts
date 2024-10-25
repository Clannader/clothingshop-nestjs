/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';
import { Observable } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CmsSession, ErrorPromise } from '@/common';

@Injectable()
export class StagingHttpService extends HttpAbstractService {
  initInterceptor() {}

  initConfig(session: CmsSession, config: AxiosRequestConfig = {}) {
    this.session = session;
    this.service.defaults.baseURL = config.baseURL;
  }

  responseResult<T>(
    targetRequest: Observable<AxiosResponse<T>>,
    respData: AxiosResponse<T>,
  ): Promise<AxiosResponse<T>> {
    return Promise.resolve(respData);
  }
}
