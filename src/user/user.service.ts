import { Injectable } from '@nestjs/common';
import { UserSchemaDto, UserSchema } from './dto/user-schema.dto';
import { AopLogger } from '../logger/aop.logger';
import { CommonResult } from '../public/dto/common.dto';
import { CodeEnum } from '../public/enum/common.enum';

@Injectable()
export class UserService {
  constructor(private readonly logger: AopLogger) {
    this.logger.setContext('UserService');
  }

  getUsersList(username: string, password: string): UserSchemaDto {
    const user = new UserSchema();
    user.username = username;
    user.password = password;
    user.age = 12;
    console.log(this.systemService.config());
    this.logger.log('哈哈Logger');

    const resp = new UserSchemaDto();
    resp.code = 100;
    resp.user = user;
    return resp;
  }

  userLogin() {

  }

  userLogout(): CommonResult {
    const resp = new CommonResult();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }
}
