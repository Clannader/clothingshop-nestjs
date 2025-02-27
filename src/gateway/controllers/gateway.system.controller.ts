/**
 * Create by CC on 2022/8/18
 */
import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
} from '@/common/decorator';
import { SystemService } from '@/system';
import { RespWebConfigDto } from '@/system/dto';
import { JwtGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';

@ApiCommon({ showCredential: false, showJwtToken: true })
@UseGuards(JwtGuard)
@Controller('/gateway/api/system')
@ApiBearerAuth()
@ApiTagsController('GatewaySystemController', '第三方调用接口')
@ApiRights(
  RightsEnum.OtherSetup,
  RightsEnum.SystemDataSetup,
  RightsEnum.SystemBaseSetup,
)
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
  @ApiRights(RightsEnum.AllConfigList)
  getSystemConfig() {
    return this.systemService.getSystemConfig();
  }
}
