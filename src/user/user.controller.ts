import {
  Controller,
  Get,
  Query,
  Post,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CmsSession } from '@/common';
import { ApiCommon, ApiCustomResponse, UserSession } from '@/common/decorator';
import { ReqUserSearchDto, RespUserSearchDto, RespUserRolesDto } from './dto';
import { HttpInterceptor } from '@/interceptor/http';
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

  @Post('roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '返回用户角色权限',
    description: '查询用户权限信息',
  })
  @ApiCustomResponse({
    type: RespUserRolesDto,
  })
  getUserRoles(@UserSession() session: CmsSession) {
    return this.userService.getUserRoles(session);
  }
}
