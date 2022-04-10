import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import UserSchema from './entity/UserSchema';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('getUser')
  @ApiOperation({
    summary: '测试方法',
    description: '获取一个字符串',
  })
  @ApiBody({ type: UserSchema })
  @ApiResponse({ type: UserSchema, status: 1000 })
  getUser(@Body() user: UserSchema) {
    return this.userService.getUser(user.username, user.password);
  }
}
