/**
 * Create by oliver.wu 2026/9/23
 */
import { Injectable } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';

import { MqttConfig } from '../types';
import { Utils } from '@/common/utils';
import {
  MqttPublishInfo,
  MqttSubscribeInfo,
  MqttSubscriptionsInfo,
  MqttSubscriptionSubDto,
  MqttUnsubscribeInfo,
} from '../dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';

@Injectable()
export class MqttAbstractService {
  private client?: MqttClient;
  private readonly mqttConfig: MqttConfig;
  private maxReconnectionAttempts: number = 0; // 最大重连次数

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
        reconnectPeriod: 10 * 1000, // 每次重连间隔时间
        connectTimeout: 30 * 1000, // 连接超时时间
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
      this.maxReconnectionAttempts = 0;
      console.log(`${this.getClientName()}已连接 broker ${brokerUrl}`);
      this.resubscribeAll();
    });

    // 收到消息
    this.client.on('message', (topic, payload, packet) => {
      // 服务器上的MQTT不会用于接收消息,因为服务器是集群的,如果订阅,会造成收消息风暴
      // 服务器上的MQTT只适用于发消息
      console.log(
        `${this.getClientName()}收到消息: topic=${topic}, payload=${payload.toString('utf-8')}, qos=${packet.qos}, retain=${packet.retain}`,
      );
    });

    this.client.on('error', (err) => {
      console.error(
        `${this.getClientName()}连接错误: ${Utils.errMessage(err)}`,
      );
    });
    this.client.on('close', () => {
      this.maxReconnectionAttempts++;
      console.log(`${this.getClientName()}连接已关闭(自动重连中...)`);
      if (this.maxReconnectionAttempts >= 100) {
        this.stop();
      }
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
    return this.client !== undefined && this.client.connected === true;
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

  /** 连接状态 + 当前订阅清单 */
  getSubscriptionsInfo(): MqttSubscriptionsInfo {
    return {
      connected: this.isConnected(),
      brokerUrl: this.mqttConfig.brokerUrl,
      subscriptions: [...this.subscriptions.entries()].map(([topic, qos]) => ({
        topic,
        qos,
      })),
    };
  }

  /**
   * 校验topic是否合法
   */
  checkTopicName(topic: string): string {
    const rawTopic = typeof topic === 'string' ? topic.trim() : '';
    if (rawTopic.length === 0) {
      throw new CodeException(CodeEnum.EXCEPTION, 'Topic必填且为非空字符串');
    }
    return rawTopic;
  }

  /**
   * 退订 topic
   */
  unsubscribe(topic: string): MqttUnsubscribeInfo {
    const rawTopic = this.checkTopicName(topic);
    this.subscriptions.delete(rawTopic);
    if (this.isConnected()) {
      this.client.unsubscribe(rawTopic, (err) => {
        if (err) {
          console.error(
            `${this.getClientName()}退订 ${rawTopic} 失败: ${Utils.errMessage(err)}`,
          );
        } else {
          console.error(`${this.getClientName()}退订 ${rawTopic} 成功`);
        }
      });
    }
    return {
      topic: rawTopic,
      unsubscribedAt: new Date().toISOString(),
      activeSubscriptions: [...this.subscriptions.keys()],
    };
  }

  /**
   * 订阅 topic
   */
  async subscribe(
    topicInfo: MqttSubscriptionSubDto,
  ): Promise<MqttSubscribeInfo> {
    const rawTopic = this.checkTopicName(topicInfo.topic);
    const qos = topicInfo.qos ?? this.mqttConfig.defaultQos;
    if (!this.isConnected()) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}客户端未连接 broker，无法订阅`,
      );
    }
    try {
      await new Promise<void>((resolve, reject) => {
        this.client.subscribe(rawTopic, { qos }, (err) =>
          err ? reject(err) : resolve(),
        );
      });
    } catch (err) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}订阅失败: ${Utils.errMessage(err)}`,
      );
    }

    this.subscriptions.set(rawTopic, qos);
    return {
      topic: rawTopic,
      qos,
      subscribedAt: new Date().toISOString(),
      activeSubscriptions: [...this.subscriptions.keys()],
    };
  }

  /**
   * 推送消息
   */
  async publish(messageInfo: MqttPublishInfo) {
    const rawTopic = this.checkTopicName(messageInfo.topic);
    if (!this.isConnected()) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}客户端未连接 broker，无法发送消息`,
      );
    }
    try {
      await new Promise<void>((resolve, reject) => {
        this.client.publish(rawTopic, messageInfo.message, (err, packet) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    } catch (err) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}发送消息失败: ${Utils.errMessage(err)}`,
      );
    }
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
