import { Body, Controller, Post, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOAuth2 } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserSchema } from './dto/user-schema.dto';
import { CommonResult } from '../public/dto/common.dto';
import {
  ApiCommon,
  ApiCustomStatus,
} from '../public/decorator/common.decorator';

@ApiCommon()
@ApiOAuth2(['pets:write'])
@Controller('/cms/api/user')
@ApiTags('UserController')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCustomStatus()
  @Post('getUser')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试方法',
    description: '获取一个字符串',
  })
  getUser(@Body() user: UserSchema) {
    return this.userService.getUser(user.username, user.password);
  }

  @Get('getEnum')
  @ApiOperation({
    summary: '测试swagger',
    description: '测试类型',
  })
  getEnum(@Query() user: CommonResult) {
    return user;
  }
}
