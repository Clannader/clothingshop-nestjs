import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiOAuth2,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserSchemaDto } from './dto/user-schema.dto';

@ApiOAuth2(['pets:write'])
@Controller('/cms/api/user')
@ApiTags('UserController')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('getUser')
  @ApiOperation({
    summary: '测试方法',
    description: '获取一个字符串',
  })
  @ApiBody({ type: UserSchemaDto })
  @ApiResponse({ type: UserSchemaDto, status: 1000 })
  getUser(@Body() user: UserSchemaDto) {
    console.log(user)
    return this.userService.getUser(user.username, user.password);
  }
}
