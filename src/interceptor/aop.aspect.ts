/**
 * Create by CC on 2022/7/19
 */
import { Response } from 'express';
import { CodeEnum, ConfigService, RequestSession } from '@/common';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AopAspect {
  async logAspect(req: RequestSession, res: Response) {
    console.log('sss');
  }
}
