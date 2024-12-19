import {
  Controller,
  Get,
  UseInterceptors,
  UseGuards,
  Post,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import {
  ApiCommon,
  ApiCustomResponse,
  UserSession,
  ApiTagsController,
} from '@/common/decorator';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';

import {
  RespWebConfigDto,
  RespPackageVersionDto,
  RespSequenceResult,
  ReqSequenceResult,
} from '../dto';
import { SystemService } from '../services/system.service';
import { CmsSession } from '@/common';

@ApiCommon()
@Controller('/cms/api/system')
@ApiTagsController('SystemController', '系统模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(RightsEnum.OtherSetup, RightsEnum.SystemDataSetup)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('/config/search')
  @ApiOperation({
    summary: '获取系统配置',
    description: '获取系统默认的全局配置',
  })
  @ApiCustomResponse({
    type: RespWebConfigDto,
  })
  @ApiRights(RightsEnum.SystemBaseSetup)
  getSystemConfig() {
    return this.systemService.getSystemConfig();
  }

  @Get('/package/version')
  @ApiOperation({
    summary: '获取依赖包版本',
    description: '获取当前安装的所有依赖包版本',
  })
  @ApiCustomResponse({
    type: RespPackageVersionDto,
  })
  @ApiRights(RightsEnum.PackageVersionSetup)
  getPackageVersion() {
    return this.systemService.getPackageVersion();
  }

  @Post('/sequence/getNextNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取序列号',
    description: '根据类型获取唯一序列号',
  })
  @ApiCustomResponse({
    type: RespSequenceResult,
  })
  @ApiRights(RightsEnum.GetSequenceNumber)
  getSequenceNumber(
    @UserSession() session: CmsSession,
    @Body() params: ReqSequenceResult,
  ) {
    return this.systemService.getSequenceNumber(session, params);
  }
}
