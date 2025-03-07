/**
 * Create by oliver.wu 2025/3/7
 */
import {
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
  UserSession,
} from '@/common/decorator';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';

import { ServerLogService } from '../services';
import {
  RespServerLogListDto,
  ReqServerLogListDto,
  RespInternalServerLogDto,
} from '../dto';
import { CmsSession } from '@/common';

@ApiCommon()
@Controller('/cms/api/logs/serverLog')
@ApiTagsController('ServerLogController', '服务器日志模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(RightsEnum.LogsManage, RightsEnum.ServerLogSetup)
export class ServerLogController {
  @Inject()
  private readonly serverLogService: ServerLogService;

  @Get('/getList')
  @ApiOperation({
    summary: '获取服务器日志列表',
    description: '获取服务器日志列表',
  })
  @ApiCustomResponse({
    type: RespServerLogListDto,
  })
  @ApiRights(RightsEnum.ServerLogView)
  getServerLogList(
    @Query() params: ReqServerLogListDto,
    @UserSession() session: CmsSession,
  ) {
    return this.serverLogService.getServerLogList(session, params);
  }

  @ApiExcludeEndpoint(true)
  @Get('/logs')
  @ApiOperation({
    summary: '内部获取服务器日志列表',
    description: '内部获取服务器日志列表',
  })
  @ApiCustomResponse({
    type: RespInternalServerLogDto,
  })
  @ApiRights(RightsEnum.ServerLogView)
  getInternalServerLogList(@Query() params: ReqServerLogListDto) {
    return this.serverLogService.getInternalServerLogList(params);
  }
}
