/**
 * Create by oliver.wu 2026/7/3
 */
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
} from '@/common/decorator';
import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  Post,
  Body,
} from '@nestjs/common';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor/http';

import { SubRecordService } from '../services';
import { ApiOperation } from '@nestjs/swagger';
import {
  ReqSubRecordListDto,
  RespSubRecordListDto,
  ReqSubRecordCreateMasterDto,
} from '@/subRecord/dto';
import { CommonResult } from '@/common';

@ApiCommon()
@Controller('/cms/api/subRecord')
@ApiTagsController('SubRecordController', '测试子文档模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
export class SubRecordController {
  constructor(private readonly subRecordService: SubRecordService) {}

  @Get('/getList')
  @ApiOperation({
    summary: '获取子文档列表',
    description: '获取子文档列表',
  })
  @ApiCustomResponse({
    type: RespSubRecordListDto,
  })
  getTestOrderList(@Query() params: ReqSubRecordListDto) {
    return this.subRecordService.getTestOrderList(params);
  }

  @Post('/createMaster')
  @ApiOperation({
    summary: '创建主文档',
    description: '创建主文档',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  createMasterDoc(@Body() params: ReqSubRecordCreateMasterDto) {
    return this.subRecordService.createMasterDoc(params);
  }
}
