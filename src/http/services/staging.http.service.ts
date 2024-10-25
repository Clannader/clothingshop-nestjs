/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';

@Injectable()
export class StagingHttpService extends HttpAbstractService {
  initInterceptor() {

  }

  initConfig() {
    this.service.defaults.baseURL = 'http://localhost:3000';
  }
}
