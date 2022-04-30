import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOAuth2 } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserSchemaDto, UserSchema } from './dto';
import { CommonResult, ApiCommon, ApiCustomResponse, } from '../common';

@ApiCommon()
@ApiOAuth2(['pets:write'])
@Controller('/cms/api/user')
@ApiTags('UserController')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('getUser')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试方法',
    description: '获取一个字符串',
  })
  @ApiCustomResponse({
    type: UserSchemaDto,
  })
  getUser(@Body() user: UserSchema) {
    return this.userService.getUser(user.username, user.password);
  }

  @Get('getEnum')
  @ApiOperation({
    summary: '测试swagger',
    description: '测试类型',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  getEnum(@Query() user: CommonResult) {
    return user;
  }
}
