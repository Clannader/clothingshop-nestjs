import { Inject, Injectable } from '@nestjs/common';
import { UserSchemaDto } from './dto/user-schema.dto';
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
    const user = new UserSchemaDto();
    user.username = username;
    user.password = password;
    console.log(this.systemService.config());
    this.logger.log('哈哈Logger');
    return user;
  }
}
