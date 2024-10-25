/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable, Inject } from '@nestjs/common';

import { LocalhostHttpService } from './localhost.http.service';

import type { HttpAbstractService } from './http.abstract.service';

@Injectable()
export class HttpFactoryService {
  @Inject()
  private readonly localhostHttpService: LocalhostHttpService;

  getHttpService(shopType: string): HttpAbstractService {
    if (shopType === 'localhost') {
      return this.localhostHttpService;
    } else {
      throw new Error(`Cannot find http service instance: ${shopType}`);
    }
  }
}
