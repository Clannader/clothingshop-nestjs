import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ApiCommon, ApiCustomResponse } from '@/common';
import { ReqUserSearchDto, RespUserSearchDto } from './dto';
import { HttpInterceptor } from '@/interceptor';
import { SessionGuard } from '@/guard';
import { Rights, RightsEnum } from '@/rights';

@ApiCommon()
@Controller('/cms/api/user')
@ApiTags('UserController')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
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
  @Rights(RightsEnum.UserSetup)
  getUsersList(@Query() params: ReqUserSearchDto) {
    return this.userService.getUsersList(params);
  }
}
