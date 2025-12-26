/**
 * Create by oliver.wu 2025/12/4
 */
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
  UserSession,
} from '@/common/decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor/http';
import { ApiRights, RightsEnum } from '@/rights';

import { RightsGroupService } from '../services';

import { ApiOperation } from '@nestjs/swagger';
import { CmsSession, RespModifyDataDto } from '@/common';
import { ReqRightsGroupSearchDto, RespRightsGroupSearchDto } from '../dto';

@ApiCommon()
@Controller('/cms/api/rightsGroup')
@ApiTagsController('RightsGroupController', '权限组模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(
  RightsEnum.OtherSetup,
  RightsEnum.RightsSetup,
  RightsEnum.RightsGroupSetup,
)
export class RightsGroupController {
  constructor(private readonly rightsGroupService: RightsGroupService) {}

  @Get('/search')
  @ApiOperation({
    summary: '获取权限组列表',
    description: '获取权限组列表',
  })
  @ApiCustomResponse({
    type: RespRightsGroupSearchDto,
  })
  getRightsGroupList(
    @UserSession() session: CmsSession,
    @Query() params: ReqRightsGroupSearchDto,
  ) {
    return this.rightsGroupService.getRightsGroupList(session, params);
  }
}
