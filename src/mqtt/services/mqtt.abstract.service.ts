/**
 * Create by oliver.wu 2026/9/23
 */
import { Injectable } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';

import { MqttConfig } from '../types';
import { Utils } from '@/common/utils';

@Injectable()
export class MqttAbstractService {
  private client?: MqttClient;
  private readonly mqttConfig: MqttConfig;

  /** 该链接的所有订阅列表 */
  private readonly subscriptions = new Map<string, 0 | 1 | 2>();

  constructor(mqttConfig: MqttConfig) {
    this.mqttConfig = mqttConfig;
  }

  /**
   * 启动客户端（
   */
  start(): void {
    // 幂等防护：已创建过客户端即视为已启动
    if (this.client !== undefined) {
      return;
    }

    const {
      brokerUrl,
      clientId,
      username,
      password,
      defaultTopics,
      defaultQos,
    } = this.mqttConfig;

    if (Utils.isEmpty(brokerUrl)) {
      return;
    }

    // 如果有默认订阅,需要初始化
    // 实际订阅动作统一由 'connect' 重放
    for (const topic of defaultTopics) {
      this.subscriptions.set(topic, defaultQos);
    }

    try {
      this.client = connect(brokerUrl, {
        protocolVersion: 4,
        ...(clientId !== undefined ? { clientId } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(password !== undefined ? { password } : {}),
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
      });
    } catch (err) {
      console.error(
        `${this.getClientName()}创建失败: ${Utils.errMessage(err)}`,
      );
      this.client = undefined;
      return;
    }

    console.log(
      `${this.getClientName()}正在连接 ${brokerUrl} (clientId=${clientId})...`,
    );

    // 首连与断线重连均触发：按订阅真源重放全部订阅，保证重连后订阅自动恢复
    this.client.on('connect', () => {
      console.log(`${this.getClientName()}已连接 broker ${brokerUrl}`);
      this.resubscribeAll();
    });

    // 收到消息
    this.client.on('message', (topic, payload, packet) => {
      console.log(
        `${this.getClientName()}收到消息: topic=${topic}, payload=${payload.toString('utf-8')}, qos=${packet.qos}, retain=${packet.retain}`,
      );
      // this.pushMessage({
      //   topic,
      //   payload: payload.toString('utf-8'),
      //   qos: packet.qos ?? 0,
      //   retain: packet.retain ?? false,
      //   receivedAt: new Date().toISOString(),
      // });
    });

    this.client.on('error', (err) => {
      console.error(
        `${this.getClientName()}连接错误: ${Utils.errMessage(err)}`,
      );
    });
    this.client.on('close', () => {
      console.log(`${this.getClientName()}连接已关闭(自动重连中...)`);
    });
    this.client.on('reconnect', () => {
      console.log(`${this.getClientName()}正在重连 broker...`);
    });
  }

  /** 重新订阅 */
  private resubscribeAll(): void {
    const client = this.client;
    if (client === undefined) {
      return;
    }
    for (const [topic, qos] of this.subscriptions) {
      client.subscribe(topic, { qos }, (err) => {
        if (err) {
          console.error(
            `${this.getClientName()}订阅 ${topic} 失败: ${Utils.errMessage(err)}`,
          );
        } else {
          console.log(`${this.getClientName()}已订阅 ${topic}(qos=${qos})`);
        }
      });
    }
  }

  /**
   * 当前是否已连接 broker
   */
  isConnected(): boolean {
    return this.client !== undefined && this.client.connected;
  }

  /**
   * 停止客户端
   */
  stop(): void {
    if (this.client === undefined) {
      return;
    }
    try {
      this.client.end();
      console.log(`${this.getClientName()}已断开连接`);
    } catch (err) {
      console.error(
        `${this.getClientName()}断开连接异常: ${Utils.errMessage(err)}`,
      );
    }
  }

  getClientName() {
    return `[MQTT] 客户端(${this.mqttConfig.brokerUrl}) `;
  }
}

export function normalizeMqttConfig(partial: Partial<MqttConfig>): MqttConfig {
  const qos = partial.defaultQos;
  return {
    brokerUrl: partial.brokerUrl,
    username: partial.username,
    password: partial.password,
    clientId: partial.clientId,
    defaultTopics: Array.isArray(partial.defaultTopics)
      ? partial.defaultTopics
      : [],
    defaultQos: qos === 1 || qos === 2 ? qos : 0,
  };
}
