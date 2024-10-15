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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiCommon, ApiCustomResponse } from '@/common/decorator';
import { CommonResult } from '@/common';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';

import { TimeZoneService } from '../services';
import {
  ReqTimeZoneListDto,
  RespTimeZoneListDto,
  ReqTimeZoneCreateDto,
  RespTimeZoneCreateDto,
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
  getSequenceNumber(@Body() params: ReqTimeZoneCreateDto) {
    return this.timeZoneService.createTimeZone(params);
  }
}
