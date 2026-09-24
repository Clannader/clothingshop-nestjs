/**
 * Create by oliver.wu 2026/9/24
 */
import { CommonResult } from '@/common';
import {
  MqttSubscriptionsInfo,
  MqttSubscribeInfo,
  MqttUnsubscribeInfo,
} from './document-mqtt.dto';

export class RespSubscriptionsInfo extends CommonResult {
  /**
   * Mqtt连接信息
   */
  connectInfo: MqttSubscriptionsInfo;
}

export class RespMqttSubscribeInfo extends CommonResult {
  /**
   * 订阅主题信息
   */
  subscribeInfo: MqttSubscribeInfo;
}

export class RespMqttUnsubscribeInfo extends CommonResult {
  /**
   * 订阅主题信息
   */
  unsubscribeInfo: MqttUnsubscribeInfo;
}
