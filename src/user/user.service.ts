import { Injectable } from '@nestjs/common';
import UserSchema from './entity/UserSchema';

@Injectable()
export class UserService {
  getUser(username: string, password: string): UserSchema {
    const user = new UserSchema();
    user.username = username;
    user.password = password;
    return user;
  }
}
