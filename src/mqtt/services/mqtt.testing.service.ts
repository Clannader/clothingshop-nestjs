/**
 * Create by oliver.wu 2026/10/29
 */
import { Inject, Injectable } from '@nestjs/common';
import { MqttPublishInfo } from '@/mqtt/dto';
import { CommonResult } from '@/common';
import { MqttSingleService } from '../services';
import { CodeEnum } from '@/common/enum';

@Injectable()
export class MqttTestingService {
  @Inject()
  private readonly mqttSingleService: MqttSingleService;

  async sendMessage(params: MqttPublishInfo) {
    const resp = new CommonResult();
    // 以后补充其他业务流程
    try {
      // 到这一步就发消息出去
      await this.mqttSingleService.sendMessage(params);
    } catch (e) {
      resp.code = CodeEnum.FAIL;
      resp.msg = e.message;
    }
    return resp;
  }
}
