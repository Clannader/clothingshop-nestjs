/**
 * Create by oliver.wu 2024/10/25
 */
/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';

@Injectable()
export class JwtHttpService extends HttpAbstractService {
  initInterceptor() {
    this.service.defaults.baseURL = 'http://localhost:3000';
  }
}
