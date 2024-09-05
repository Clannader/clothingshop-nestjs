import { Controller, Get, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommon, ApiCustomResponse } from '@/common/decorator';
import { SystemService } from './system.service';
import { RespWebConfigDto } from './dto';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';

@ApiCommon()
@Controller('/cms/api/system')
@ApiTags('SystemController')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('/config/search')
  @ApiOperation({
    summary: '获取系统配置',
    description: '获取系统默认的全局配置',
  })
  @ApiCustomResponse({
    type: RespWebConfigDto,
  })
  getSystemConfig() {
    return this.systemService.getSystemConfig();
  }
}
