/**
 * Create by oliver.wu 2024/11/27
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
import { ApiOrRights, ApiRights, RightsEnum } from '@/rights';
import { SystemConfigService } from '../services';
import {
  ReqChildrenConfigCheckInfoDto,
  ReqChildrenConfigCreateDto,
  ReqChildrenConfigModifyDto,
  ReqParentConfigCheckInfoDto,
  ReqParentConfigCreateDto,
  ReqParentConfigDeleteDto,
  ReqParentConfigModifyDto,
  ReqSystemConfigListDto,
  RespSystemChildrenConfigCreateDto,
  RespSystemConfigCreateDto,
  RespSystemConfigListDto,
} from '../dto/config';
import {
  CmsSession,
  CommonResult,
  RespErrorResult,
  SecurityOptions,
} from '@/common';
import { plainToInstance } from 'class-transformer';
import { Utils } from '@/common/utils';

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
  @ApiCustomResponse(
    {
      type: RespSystemConfigCreateDto,
    },
    {
      showRsaToken: true,
      rsaTokenRequired: false,
    },
  )
  @ApiRights(RightsEnum.ConfigCreate)
  createParentConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqParentConfigCreateDto,
    @Headers('Security-Token') securityToken: string,
    @Headers('Security-Id') securityId: string,
  ): Promise<RespSystemConfigCreateDto> {
    const securityOptions: SecurityOptions = {
      securityToken,
      securityId,
    };
    const modifyParams = plainToInstance(ReqParentConfigModifyDto, params);
    return this.systemConfigService.saveSystemParentConfig(
      session,
      modifyParams,
      true,
      securityOptions,
    );
  }

  @Put('/parent/modify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '编辑一级配置',
    description: '编辑已存在的一级配置',
  })
  @ApiCustomResponse(
    {
      type: RespSystemConfigCreateDto,
    },
    {
      showRsaToken: true,
      rsaTokenRequired: false,
    },
  )
  @ApiRights(RightsEnum.ConfigModify)
  modifyParentConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqParentConfigModifyDto,
    @Headers('Security-Token') securityToken: string,
    @Headers('Security-Id') securityId: string,
  ): Promise<RespSystemConfigCreateDto> {
    const securityOptions: SecurityOptions = {
      securityToken,
      securityId,
    };
    return this.systemConfigService.saveSystemParentConfig(
      session,
      params,
      false,
      securityOptions,
    );
  }

  @Delete('/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除一级/二级配置',
    description: '删除一级/二级配置',
  })
  @ApiCustomResponse({
    type: RespErrorResult,
  })
  @ApiRights(RightsEnum.ConfigDelete)
  deleteParentConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqParentConfigDeleteDto,
  ) {
    return this.systemConfigService.deleteSystemConfig(session, params);
  }

  @Post('/parent/checkInfo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '校验一级配置数据',
    description: '校验一级配置数据',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiOrRights(RightsEnum.ConfigCreate, RightsEnum.ConfigModify)
  checkInfoParentConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqParentConfigCheckInfoDto,
  ) {
    const isNew = Utils.isEmpty(params.id);
    const modifyParams = plainToInstance(ReqParentConfigModifyDto, params);
    return this.systemConfigService.checkInfoParentConfig(
      session,
      modifyParams,
      isNew,
      true,
    );
  }

  @Post('/children/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '新增二级配置',
    description: '新增二级配置',
  })
  @ApiCustomResponse({
    type: RespSystemChildrenConfigCreateDto,
  })
  @ApiRights(RightsEnum.ConfigChildrenCreate)
  createChildrenConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqChildrenConfigCreateDto,
  ): Promise<RespSystemChildrenConfigCreateDto> {
    const modifyParams = plainToInstance(ReqChildrenConfigModifyDto, params);
    return this.systemConfigService.saveSystemChildrenConfig(
      session,
      modifyParams,
      true,
    );
  }

  @Put('/children/modify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '编辑二级配置',
    description: '编辑已存在的二级配置',
  })
  @ApiCustomResponse({
    type: RespSystemChildrenConfigCreateDto,
  })
  @ApiRights(RightsEnum.ConfigChildrenModify)
  modifyChildrenConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqChildrenConfigModifyDto,
  ): Promise<RespSystemChildrenConfigCreateDto> {
    return this.systemConfigService.saveSystemChildrenConfig(
      session,
      params,
      false,
    );
  }

  @Post('/children/checkInfo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '校验二级配置数据',
    description: '校验二级配置数据',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiOrRights(RightsEnum.ConfigChildrenCreate, RightsEnum.ConfigChildrenModify)
  checkInfoChildrenConfig(
    @UserSession() session: CmsSession,
    @Body() params: ReqChildrenConfigCheckInfoDto,
  ) {
    const isNew = Utils.isEmpty(params.id);
    const modifyParams = plainToInstance(ReqChildrenConfigModifyDto, params);
    return this.systemConfigService.checkInfoChildrenConfig(
      session,
      modifyParams,
      isNew,
      true,
    );
  }
}
