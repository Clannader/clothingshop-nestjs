/**
 * Create by oliver.wu 2024/10/25
 */
/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';
import { Observable } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CmsSession, ErrorPromise } from '@/common';

@Injectable()
export class JwtHttpService extends HttpAbstractService {
  initConfig(session: CmsSession, config: AxiosRequestConfig = {}) {
    this.session = session;
    this.service.defaults.baseURL = config.baseURL;
    this.initInterceptor();
  }

  initInterceptor() {}

  responseResult(
    targetRequest: Observable<AxiosResponse>,
    respData: AxiosResponse,
  ): Promise<AxiosResponse> {
    return Promise.resolve(respData);
  }
}
