import { Injectable } from '@nestjs/common';
import { AopLogger } from '../logger';
import { CodeEnum, CommonResult } from '../common';
import {
  ReqUserLoginDto,
  RespUserLoginDto,
  ReqUserSearchDto,
  RespUserSearchDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(private readonly logger: AopLogger) {
    this.logger.setContext('UserService');
  }

  getUsersList(params: ReqUserSearchDto): RespUserSearchDto {
    console.log(params);
    const resp = new RespUserSearchDto();
    resp.code = 100;
    return resp;
  }

  userLogin(params: ReqUserLoginDto): RespUserLoginDto {
    console.log(params);
    const resp = new RespUserLoginDto();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  userLogout(): CommonResult {
    const resp = new CommonResult();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }
}
