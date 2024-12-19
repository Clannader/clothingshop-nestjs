/**
 * Create by oliver.wu 2024/11/27
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  ApiCommon,
  ApiCustomResponse,
  UserSession,
  ApiTagsController,
} from '@/common/decorator';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';
import { Utils } from '@/common/utils';
import { plainToInstance } from 'class-transformer';

import { SystemConfigService } from '../services';
import { ReqSystemConfigListDto, RespSystemConfigListDto } from '../dto/config';

@ApiCommon()
@Controller('/cms/api/system/config')
@ApiTagsController('SystemConfigController', '系统配置模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(
  RightsEnum.OtherSetup,
  RightsEnum.SystemDataSetup,
  RightsEnum.SystemBaseSetup,
)
export class SystemConfigController {
  @Inject()
  private readonly systemConfigService: SystemConfigService;

  @Get('/getList')
  @ApiOperation({
    summary: '获取系统配置列表',
    description: '获取全部的系统配置列表',
  })
  @ApiCustomResponse({
    type: RespSystemConfigListDto,
  })
  @ApiRights(RightsEnum.AllConfigList)
  getSystemConfigList(@Query() params: ReqSystemConfigListDto) {
    return this.systemConfigService.getSystemConfigList(params);
  }
}
