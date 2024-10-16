/**
 * Create by oliver.wu 2024/10/15
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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiCommon, ApiCustomResponse, UserSession } from '@/common/decorator';
import { CmsSession, CommonResult } from '@/common';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';

import { TimeZoneService } from '../services';
import {
  ReqTimeZoneListDto,
  RespTimeZoneListDto,
  ReqTimeZoneCreateDto,
  RespTimeZoneCreateDto,
  ReqTimeZoneModifyDto,
  RespTimeZoneAllDto,
} from '../dto';

@ApiCommon()
@Controller('/cms/api/timeZone')
@ApiTags('TimeZoneController')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(
  RightsEnum.OtherSetup,
  RightsEnum.SystemDataSetup,
  RightsEnum.TimeZoneSetup,
)
export class TimeZoneController {
  constructor(private readonly timeZoneService: TimeZoneService) {}

  @Get('/getList')
  @ApiOperation({
    summary: '获取时区列表',
    description: '获取数据库中的时区列表',
  })
  @ApiCustomResponse({
    type: RespTimeZoneListDto,
  })
  @ApiRights(RightsEnum.TimeZoneList)
  getTimeZoneList(@Query() params: ReqTimeZoneListDto) {
    return this.timeZoneService.getTimeZoneList(params);
  }

  @Get('/allList')
  @ApiOperation({
    summary: '获取全部的时区对象',
    description: '测试获取全部时区,后期更换其他controller调用',
  })
  @ApiCustomResponse({
    type: RespTimeZoneAllDto,
  })
  getAllTimeZone() {
    return this.timeZoneService.getAllTimeZone();
  }

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '新增时区',
    description: '创建时区信息',
  })
  @ApiCustomResponse({
    type: RespTimeZoneCreateDto,
  })
  @ApiRights(RightsEnum.TimeZoneCreate)
  createTimeZone(@Body() params: ReqTimeZoneCreateDto) {
    return this.timeZoneService.createTimeZone(params);
  }

  @Put('/modify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '编辑时区',
    description: '编辑已存在的时区',
  })
  @ApiCustomResponse({
    type: RespTimeZoneCreateDto,
  })
  @ApiRights(RightsEnum.TimeZoneModify)
  modifyTimeZone(@Body() params: ReqTimeZoneModifyDto) {
    return this.timeZoneService.modifyTimeZone(params);
  }

  @Post('/syncData')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '同步时区数据',
    description: '同步默认的时区数据到数据库中',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.TimeZoneSync)
  syncTimeZoneData(@UserSession() session: CmsSession) {
    return this.timeZoneService.syncTimeZoneData(session);
  }
}
