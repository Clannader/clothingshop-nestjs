import { Inject, Injectable } from '@nestjs/common';
import { UserSchemaDto, UserSchema } from './dto/user-schema.dto';
import { SystemService } from '../system/system.service';
import { AopLogger } from '../logger/aop.logger';

@Injectable()
export class UserService {
  @Inject()
  private systemService: SystemService;

  constructor(private readonly logger: AopLogger) {
    this.logger.setContext('UserService');
  }

  getUser(username: string, password: string): UserSchemaDto {
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
}
