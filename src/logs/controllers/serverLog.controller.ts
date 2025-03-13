/**
 * Create by oliver.wu 2025/3/7
 */
import {
  Controller,
  Get,
  Post,
  Inject,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Body,
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
  RespServerLogViewDto,
  RespServerLogDownloadDto,
  ReqServerLogViewDto,
  ReqServerLogDownloadDto,
} from '../dto';
import { CmsSession } from '@/common';
import { plainToInstance } from 'class-transformer';
import { ServerLogViewEnum } from '@/common/enum';
import { Utils } from '@/common/utils';

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
  @Get('/internal/list')
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

  @Post('/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '查看指定日期的日志内容',
    description: '查看指定日期的日志内容',
  })
  @ApiCustomResponse({
    type: RespServerLogViewDto,
  })
  @ApiRights(RightsEnum.ServerLogView)
  viewServerLogFile(
    @Body() params: ReqServerLogViewDto,
    @UserSession() session: CmsSession,
  ) {
    return this.serverLogService.viewServerLogFile(session, params);
  }

  @ApiExcludeEndpoint(true)
  @Post('/internal/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '内部查看指定日期的日志内容',
    description: '内部查看指定日期的日志内容',
  })
  @ApiCustomResponse({
    type: RespServerLogViewDto,
  })
  @ApiRights(RightsEnum.ServerLogView)
  internalViewServerLogFile(
    @Body() params: ReqServerLogViewDto,
    @UserSession() session: CmsSession,
  ) {
    if (Utils.isEmpty(params.startByte)) {
      params.startByte = 0;
    }
    if (Utils.isEmpty(params.endByte)) {
      params.endByte = 10 * 1024;
    }
    return this.serverLogService.internalViewServerLogFile(session, params);
  }

  @Post('/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '下载指定日期的日志内容',
    description: '下载指定日期的日志内容',
  })
  @ApiCustomResponse({
    type: RespServerLogDownloadDto,
  })
  @ApiRights(RightsEnum.ServerLogDownload)
  downloadServerLogFile(
    @Body() params: ReqServerLogDownloadDto,
    @UserSession() session: CmsSession,
  ) {
    const viewParams = plainToInstance(ReqServerLogViewDto, params);
    viewParams.viewType = ServerLogViewEnum.Download;
    return this.serverLogService.viewServerLogFile(session, viewParams);
  }

  @ApiExcludeEndpoint(true)
  @Post('/internal/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '内部下载指定日期的日志内容',
    description: '内部下载指定日期的日志内容',
  })
  @ApiCustomResponse({
    type: RespServerLogDownloadDto,
  })
  @ApiRights(RightsEnum.ServerLogDownload)
  internalDownloadServerLogFile(
    @Body() params: ReqServerLogDownloadDto,
    @UserSession() session: CmsSession,
  ) {
    const viewParams = plainToInstance(ReqServerLogViewDto, params);
    viewParams.viewType = ServerLogViewEnum.Download;
    return this.serverLogService.internalViewServerLogFile(session, viewParams);
  }
}
