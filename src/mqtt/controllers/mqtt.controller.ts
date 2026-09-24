/**
 * Create by oliver.wu 2026/9/24
 */
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
} from '@/common/decorator';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor/http';
import { ApiRights, RightsEnum } from '@/rights';
import { MqttAbstractService } from '@/mqtt';
import { ApiOperation } from '@andybeat/swagger';
import { RespSubscriptionsInfo } from '@/mqtt/dto';

@ApiCommon()
@Controller('/cms/api/mqtt')
@ApiTagsController('MqttController', 'MQTT消息模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(
  RightsEnum.OtherSetup,
  RightsEnum.SystemDataSetup,
  RightsEnum.MqttServiceSetup,
)
export class MqttController {
  constructor(private readonly mqttService: MqttAbstractService) {}

  @Get('/getConnectInfo')
  @ApiOperation({
    summary: '获取MQTT连接信息',
    description: '获取MQTT连接信息',
  })
  @ApiCustomResponse({
    type: RespSubscriptionsInfo,
  })
  getConnectInfo() {
    const resp = new RespSubscriptionsInfo();
    resp.connectInfo = this.mqttService.getSubscriptionsInfo();
    return resp;
  }
}
