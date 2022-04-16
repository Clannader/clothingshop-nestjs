import { Injectable } from '@nestjs/common';
import { UserSchemaDto } from './entity/user-schema.dto';

@Injectable()
export class UserService {
  getUser(username: string, password: string): UserSchemaDto {
    const user = new UserSchemaDto();
    user.username = username;
    user.password = password;
    return user;
  }
}
