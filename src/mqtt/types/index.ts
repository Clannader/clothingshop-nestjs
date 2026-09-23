/**
 * Create by oliver.wu 2026/9/23
 */
export interface MqttConfig {
  /** broker 连接地址 */
  brokerUrl: string;
  /** broker 用户名 */
  username?: string;
  /** broker 密码 */
  password?: string;
  /** MQTT 客户端 ID */
  clientId?: string;
  /** 默认 QoS */
  defaultQos?: 0 | 1 | 2;
  /** 订阅的默认 topic 列表 */
  defaultTopics?: string[];
}
