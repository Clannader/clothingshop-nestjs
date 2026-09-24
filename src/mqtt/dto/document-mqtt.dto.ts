/**
 * Create by oliver.wu 2026/9/24
 */
export type MqttQos = 0 | 1 | 2;

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
  topic: string;

  /**
   * 订阅 QoS 等级
   * @example 0
   */
  qos: MqttQos;
}
