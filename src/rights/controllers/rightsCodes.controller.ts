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
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor/http';
import { ApiRights, RightsEnum } from '@/rights';

import { RightsCodesService } from '../services/';

import { ReqRightsCodesSearchDto, RespRightsCodesSearchDto } from '../dto';
import { ApiOperation } from '@nestjs/swagger';
import { CmsSession } from '@/common';

@ApiCommon()
@Controller('/cms/api/rightsCodes')
@ApiTagsController('RightsCodesController', '权限代码模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(
  RightsEnum.OtherSetup,
  RightsEnum.RightsSetup,
  RightsEnum.RightsCodeSetup,
)
export class RightsCodesController {
  constructor(private readonly rightsCodesService: RightsCodesService) {}

  @Get('/search')
  @ApiOperation({
    summary: '获取权限代码列表',
    description: '获取权限代码列表',
  })
  @ApiCustomResponse({
    type: RespRightsCodesSearchDto,
  })
  @ApiRights(RightsEnum.RightsCodeSearch)
  getRightsCodesList(
    @UserSession() session: CmsSession,
    @Query() params: ReqRightsCodesSearchDto,
  ) {
    return this.rightsCodesService.getRightsCodesList(session, params);
  }
}
