import { Inject, Injectable } from '@nestjs/common';
import { UserSchemaDto } from './entity/user-schema.dto';
import { SystemService } from '../system/system.service';

@Injectable()
export class UserService {
  @Inject()
  private systemService: SystemService;

  getUser(username: string, password: string): UserSchemaDto {
    const user = new UserSchemaDto();
    user.username = username;
    user.password = password;
    console.log(this.systemService.config());
    return user;
  }
}
