/**
 * Create by oliver.wu 2024/10/16
 */
import { Injectable, Inject } from '@nestjs/common';
import { GlobalService } from '@/common/utils';

@Injectable()
export class TestService {
  @Inject()
  private readonly globalService: GlobalService;

  public testI: number = 0;
}