import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOAuth2 } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ApiCommon, ApiCustomResponse, } from '../common';
import {ReqUserSearchDto, RespUserSearchDto } from './dto';

@ApiCommon()
@ApiOAuth2(['pets:write'])
@Controller('/cms/api/user')
@ApiTags('UserController')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @ApiOperation({
    summary: '返回用户列表',
    description: '查询系统用户列表',
  })
  @ApiCustomResponse({
    type: RespUserSearchDto,
  })
  getEnum(@Query() params: ReqUserSearchDto) {
    return this.userService.getUsersList(params);
  }
}
