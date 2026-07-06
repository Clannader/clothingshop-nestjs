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
  RespSubRecordQueryMasterDto,
  ReqSubRecordQueryMasterDto,
} from '@/subRecord/dto';
import { CommonResult, RespModifyDataDto } from '@/common';

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
    type: RespModifyDataDto,
  })
  createMasterDoc(@Body() params: ReqSubRecordCreateMasterDto) {
    return this.subRecordService.createMasterDoc(params);
  }

  @Get('/master/getList')
  @ApiOperation({
    summary: '获取主文档列表',
    description: '获取主文档列表',
  })
  @ApiCustomResponse({
    type: RespSubRecordQueryMasterDto,
  })
  getMasterList(@Query() params: ReqSubRecordQueryMasterDto) {
    return this.subRecordService.getMasterList(params);
  }
}
