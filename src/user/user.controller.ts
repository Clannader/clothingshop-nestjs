import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiOAuth2,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserSchemaDto, UserSchema } from './dto/user-schema.dto';
import { CommonResult } from '../public/dto/common.dto';
import { ApiCommon } from '../public/decorator/common.decorator';

@ApiCommon()
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
  @ApiBody({ type: UserSchema })
  @ApiResponse({ type: UserSchemaDto, status: 100, description: '响应成功' })
  getUser(@Body() user: UserSchema) {
    console.log(user);
    return this.userService.getUser(user.username, user.password);
  }

  @Get('getEnum')
  @ApiOperation({
    summary: '测试swagger',
    description: '测试类型',
  })
  @ApiBody({ type: CommonResult })
  @ApiResponse({ type: CommonResult, status: 100, description: '响应成功' })
  getEnum(@Query() user: CommonResult) {
    return new CommonResult()
  }
}
