/**
 * Create by CC on 2022/8/18
 */
import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommon, ApiCustomResponse } from '@/common';
import { SystemService } from '@/system/system.service';
import { RespWebConfigDto } from '@/system/dto';
import { JwtGuard } from '@/guard';

@ApiCommon({ showCredential: false })
@UseGuards(JwtGuard)
@Controller('/gateway/api/system')
@ApiTags('GatewaySystemController')
export class GatewaySystemController {
  @Inject()
  private readonly systemService: SystemService;

  @Get('/config/search')
  @ApiOperation({
    summary: 'JWT获取系统配置',
    description: 'JWT获取系统默认的全局配置',
  })
  @ApiCustomResponse({
    type: RespWebConfigDto,
  })
  getSystemConfig() {
    return this.systemService.getSystemConfig();
  }
}
