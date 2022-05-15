import { Inject, Injectable } from '@nestjs/common';
import { AopLogger } from '../logger';
import { CodeEnum, CommonResult, GlobalService } from '../common';
import {
  ReqUserLoginDto,
  RespUserLoginDto,
  ReqUserSearchDto,
  RespUserSearchDto,
} from './dto';

@Injectable()
export class UserService {
  private readonly logger = new AopLogger(UserService.name);

  @Inject()
  private readonly globalService: GlobalService;

  getUsersList(params: ReqUserSearchDto): RespUserSearchDto {
    this.logger.log(params);
    const resp = new RespUserSearchDto();
    resp.code = 100;
    return resp;
  }

  userLogin(params: ReqUserLoginDto): RespUserLoginDto {
    this.logger.log(params);
    const resp = new RespUserLoginDto();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  userLogout(): CommonResult {
    console.log(this.globalService.serverLang('Testing {0}', 'user.userTestArgs', 'userService'));
    const resp = new CommonResult();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }
}
