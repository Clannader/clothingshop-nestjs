/**
 * Create by oliver.wu 2026/9/24
 */
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
} from '@/common/decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor/http';
import { ApiOrRights, ApiRights, RightsEnum } from '@/rights';
import { MqttAbstractService } from '@/mqtt';
import { ApiOperation } from '@andybeat/swagger';
import {
  MqttPublishInfo,
  MqttSubscriptionSubDto,
  RespMqttSubscribeInfo,
  RespMqttUnsubscribeInfo,
  RespSubscriptionsInfo,
} from '@/mqtt/dto';
import { CommonResult } from '@/common';

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

  @Post('/subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '订阅主题',
    description: '订阅主题',
  })
  @ApiCustomResponse({
    type: RespMqttSubscribeInfo,
  })
  @ApiOrRights(RightsEnum.MqttSubscribe)
  async subscribe(@Body() params: MqttSubscriptionSubDto) {
    const resp = new RespMqttSubscribeInfo();
    resp.subscribeInfo = await this.mqttService.subscribe(params);
    return resp;
  }

  @Post('/unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '取消订阅',
    description: '取消订阅',
  })
  @ApiCustomResponse({
    type: RespMqttUnsubscribeInfo,
  })
  @ApiOrRights(RightsEnum.MqttUnsubscribe)
  unsubscribe(@Body() params: MqttSubscriptionSubDto) {
    const resp = new RespMqttUnsubscribeInfo();
    resp.unsubscribeInfo = this.mqttService.unsubscribe(params.topic);
    return resp;
  }

  @Post('/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '发布消息',
    description: '发布消息',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiOrRights(RightsEnum.MqttPublish)
  async publish(@Body() params: MqttPublishInfo) {
    const resp = new CommonResult();
    await this.mqttService.publish(params);
    return resp;
  }
}
