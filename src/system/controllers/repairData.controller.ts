/**
 * Create by oliver.wu 2024/9/19
 */
import {
  Controller,
  Post,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommon, ApiCustomResponse } from '@/common/decorator';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';

import { RepairDataService } from '../services/repairData.service';
import { CommonResult } from '@/common/dto';

@ApiCommon()
@Controller('/cms/api/repair')
@ApiTags('RepairController')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(RightsEnum.RepairData)
export class RepairDataController {
  constructor(private readonly repairService: RepairDataService) {}

  @Post('baseData')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '修复系统数据',
    description: '修复系统需要的基础数据',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.RepairBaseData)
  repairBaseData() {
    return this.repairService.repairBaseData();
  }

  @Post('dbIndex')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '修复数据库索引',
    description: '修复默认内置数据库索引',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.RepairDBIndex)
  repairDBIndex() {
    return this.repairService.repairDBIndex();
  }

  @Post('rightsGroup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '修复权限组列表',
    description: '修复默认权限和权限组',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.RepairRightsGroup)
  repairRightsGroup() {
    return this.repairService.repairRightsGroup();
  }

  @Post('selfCheck')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '自检查系统',
    description: '检查系统默认缺少什么功能,返回提示进行修复',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.SelfCheck)
  doSelfCheck() {
    return this.repairService.doSelfCheck();
  }
}
