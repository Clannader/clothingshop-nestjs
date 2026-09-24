/**
 * Create by oliver.wu 2026/9/24
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsOptional, IsEnum } from 'class-validator';

export type MqttQos = 0 | 1 | 2;
export enum MqttQosEnum {
  Zero = 0,
  One = 1,
  Two = 2,
}

export class MqttSubscriptionsInfo {
  /**
   * MQTT 客户端当前是否已连接 broker(断线重连中为 false)
   * @example false
   */
  connected: boolean;

  /**
   * Broker 连接地址
   * @example mqtt://localhost:1883
   */
  brokerUrl: string;

  /**
   * 当前生效订阅清单
   */
  subscriptions: MqttSubscriptionSubDto[];
}

export class MqttSubscriptionSubDto {
  /**
   * 订阅的 topic
   * @example testMessage
   */
  @IsDefined()
  @IsString()
  @Expose()
  topic: string;

  /**
   * 订阅 QoS 等级
   * @example 0
   */
  @IsOptional()
  @IsEnum(MqttQosEnum)
  @Expose()
  qos?: MqttQos = 0;
}

export class MqttUnsubscribeInfo {
  /**
   * 需要退订的订阅主题 topic
   * @example testMessage
   */
  topic: string;

  /**
   * 退订的时间(ISO 8601)
   * @example 2026-10-10T06:00:00.000Z
   */
  unsubscribedAt: string;

  /**
   * 退订后剩余的生效订阅清单
   */
  activeSubscriptions: string[];
}

export class MqttSubscribeInfo {
  /**
   * 需要订阅的主题 topic
   * @example testMessage
   */
  topic: string;

  /**
   * 订阅 QoS 等级
   * @example 0
   */
  qos: MqttQos;

  /**
   * 订阅成功的时间(ISO 8601)
   * @example 2026-10-10T06:00:00.000Z
   */
  subscribedAt: string;

  /**
   * 当前全部生效订阅的 topic 清单
   */
  activeSubscriptions: string[];
}

export class MqttPublishInfo {
  /**
   * 发送消息的主题 topic
   * @example testMessage
   */
  @IsDefined()
  @IsString()
  @Expose()
  topic: string;

  /**
   * 消息内容
   * @example hello mqtt
   */
  @IsDefined()
  @IsString()
  @Expose()
  message: string;
}
