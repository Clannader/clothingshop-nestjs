/**
 * Create by oliver.wu 2024/10/25
 */
/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class JwtHttpService extends HttpAbstractService {
  initInterceptor() {}

  responseResult(
    targetRequest: Observable<AxiosResponse>,
    respData: AxiosResponse,
  ): Promise<AxiosResponse> {
    return Promise.resolve(respData);
  }
}
