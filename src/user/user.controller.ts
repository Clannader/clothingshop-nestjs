import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserSchemaDto } from './entity/user-schema.dto';

@ApiBearerAuth()
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
    return this.userService.getUser(user.username, user.password);
  }
}
