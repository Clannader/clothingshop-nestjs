/**
 * Create by oliver.wu 2024/11/27
 */
import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
  UserSession,
} from '@/common/decorator';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';
import { SystemConfigService } from '../services';
import {
  ReqParentConfigCreateDto,
  ReqParentConfigModifyDto,
  ReqSystemConfigListDto,
  RespSystemConfigCreateDto,
  RespSystemConfigListDto,
  ReqParentConfigDeleteDto,
} from '../dto/config';
import { CmsSession, RespErrorResult } from '@/common';
import { plainToInstance } from 'class-transformer';

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

  @Post('/parent/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '新增一级配置',
    description: '新增一级配置',
  })
  @ApiCustomResponse({
    type: RespSystemConfigCreateDto,
  })
  @ApiRights(RightsEnum.ConfigCreate)
  createParentConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqParentConfigCreateDto,
  ): RespSystemConfigCreateDto {
    const modifyParams = plainToInstance(ReqParentConfigModifyDto, params);
    return this.systemConfigService.saveSystemParentConfig(
      session,
      modifyParams,
      true,
    );
  }

  @Put('/parent/modify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '编辑一级配置',
    description: '编辑已存在的一级配置',
  })
  @ApiCustomResponse({
    type: RespSystemConfigCreateDto,
  })
  @ApiRights(RightsEnum.ConfigModify)
  modifyParentConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqParentConfigModifyDto,
  ): RespSystemConfigCreateDto {
    return this.systemConfigService.saveSystemParentConfig(
      session,
      params,
      false,
    );
  }

  @Delete('/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除一级配置',
    description: '删除一级配置',
  })
  @ApiCustomResponse({
    type: RespErrorResult,
  })
  @ApiRights(RightsEnum.ConfigDelete)
  deleteParentConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqParentConfigDeleteDto,
  ) {
    return this.systemConfigService.deleteSystemConfig(session, params)
  }
}
