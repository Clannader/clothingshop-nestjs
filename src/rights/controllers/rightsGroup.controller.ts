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
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import {
  CmsSession,
  DeleteResultDto,
  RespErrorResult,
  RespModifyDataDto,
} from '@/common';
import {
  ReqRightsGroupSearchDto,
  RespRightsGroupSearchDto,
  ReqRightsGroupCreateDto,
  ReqRightsGroupModifyDto,
  ReqRightsGroupSingleDto,
  RespRightsGroupSingleDto,
} from '../dto';
import { plainToInstance } from 'class-transformer';

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

  @Delete('/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '删除权限组',
    description: '删除单条或多条权限组',
  })
  @ApiCustomResponse({
    type: RespErrorResult,
  })
  @ApiRights(RightsEnum.RightsGroupDelete)
  deleteRightsGroup(
    @UserSession() session: CmsSession,
    @Body() params: DeleteResultDto,
  ) {
    return this.rightsGroupService.deleteRightsGroup(session, params);
  }

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '新增权限组',
    description: '创建权限组',
  })
  @ApiCustomResponse({
    type: RespModifyDataDto,
  })
  @ApiRights(RightsEnum.RightsGroupCreate)
  createTimeZone(
    @UserSession() session: CmsSession,
    @Body() params: ReqRightsGroupCreateDto,
  ) {
    const modifyParams = plainToInstance(ReqRightsGroupModifyDto, params);
    return this.rightsGroupService.saveRightsGroup(session, modifyParams, true);
  }

  @Put('/modify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '编辑权限组',
    description: '编辑已存在的权限组',
  })
  @ApiCustomResponse({
    type: RespModifyDataDto,
  })
  @ApiRights(RightsEnum.RightsGroupModify)
  modifyTimeZone(
    @UserSession() session: CmsSession,
    @Body() params: ReqRightsGroupModifyDto,
  ) {
    return this.rightsGroupService.saveRightsGroup(session, params, false);
  }

  @Get('/search')
  @ApiOperation({
    summary: '获取单个权限组',
    description: '获取单个权限组',
  })
  @ApiCustomResponse({
    type: RespRightsGroupSingleDto,
  })
  getSingleRightsGroup(
    @UserSession() session: CmsSession,
    @Query() params: ReqRightsGroupSingleDto,
  ) {
    return this.rightsGroupService.getSingleRightsGroup(session, params);
  }
}
