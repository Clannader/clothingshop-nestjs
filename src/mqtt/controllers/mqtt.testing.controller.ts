/**
 * Create by oliver.wu 2026/10/29
 */
import {
  ApiCommon,
  ApiCustomResponse,
  ApiTagsController,
} from '@/common/decorator';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor/http';
import { ApiOperation } from '@andybeat/swagger';
import { MqttTestingService } from '../services';
import { MqttPublishInfo } from '@/mqtt/dto';
import { CommonResult } from '@/common';

@ApiCommon()
@Controller('/cms/api/mqtt/testing')
@ApiTagsController('MqttTestingController', 'MQTT测试模块')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
export class MqttTestingController {
  @Inject()
  private readonly mqttTestingService: MqttTestingService;

  @Post('/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试发送消息',
    description: '测试发送消息',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  sendMessage(@Body() params: MqttPublishInfo) {
    return this.mqttTestingService.sendMessage(params);
  }
}
