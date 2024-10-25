/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable, Inject } from '@nestjs/common';

import { LocalhostHttpService } from './localhost.http.service';
import { StagingHttpService } from './staging.http.service';
import { JwtHttpService } from './jwt.http.service';

import type { HttpAbstractService } from './http.abstract.service';

@Injectable()
export class HttpFactoryService {
  @Inject()
  private readonly localhostHttpService: LocalhostHttpService;

  @Inject()
  private readonly stagingHttpService: StagingHttpService;

  @Inject()
  private readonly jwtHttpService: JwtHttpService;

  getHttpService(shopType: string): HttpAbstractService {
    if (shopType === 'localhost') {
      return this.localhostHttpService;
    } else if (shopType === 'staging') {
      return this.stagingHttpService;
    } else if (shopType === 'jwt') {
      return this.jwtHttpService;
    } else {
      throw new Error(`Cannot find http service instance: ${shopType}`);
    }
  }
}
