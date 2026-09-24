/**
 * Create by oliver.wu 2026/9/24
 */
import { CommonResult } from '@/common';
import { MqttSubscriptionsInfo } from './document-mqtt.dto';

export class RespSubscriptionsInfo extends CommonResult {
  /**
   * Mqtt连接信息
   */
  connectInfo: MqttSubscriptionsInfo;
}
