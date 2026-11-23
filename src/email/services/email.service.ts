/**
 * Create by oliver.wu 2026/11/23
 * 邮件发送服务:基于 nodemailer 封装 SMTP 发信能力
 * 支持两种正文来源:传 template 时复用 EmailUtils 渲染 ejs + i18n,否则直接使用 html
 */
import { Injectable } from '@nestjs/common';
import {
  createTransport,
  SMTPSentMessageInfo,
  SMTPTransportOptions,
  Transporter,
} from 'nodemailer';

import { EmailConfig, RawEmailConfig } from '../types';
import { ReqEmailDto } from '../dto';
import { EmailUtils } from '../email.utils';
import { Utils } from '@/common/utils';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';
import { AopLogger } from '@/logger';

/** 隐式 TLS(SSL)端口,该端口需要 secure=true,其余端口由 nodemailer 自动协商 STARTTLS */
const SMTP_SSL_PORT = 465;
/** 配置缺失或非法时回退使用的标准 SMTP 端口 */
const DEFAULT_SMTP_PORT = 25;

@Injectable()
export class EmailService {
  private readonly transporter: Transporter<SMTPSentMessageInfo, SMTPTransportOptions>;
  private readonly emailConfig: EmailConfig;

  private readonly logger = new AopLogger(EmailService.name);

  constructor(emailConfig: EmailConfig, private readonly emailUtils: EmailUtils) {
    this.emailConfig = emailConfig;
    // createTransport 只构造连接器不会立刻建连,SMTP 不可用不会影响服务启动
    this.transporter = createTransport(this.createTransportOptions(emailConfig));
  }

  /**
   * 验证 SMTP 连接是否可用(实际建立连接并认证后立即断开),失败抛出业务异常
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
    } catch (err) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}SMTP 连接验证失败: ${Utils.errMessage(err)}`,
      );
    }
    this.logger.log(
      `${this.getClientName()}SMTP 连接验证成功: ${this.emailConfig.smtpAddress}:${this.emailConfig.smtpPort}`,
    );
    return true;
  }

  /**
   * 发送邮件
   * @param info 邮件内容,template 与 html 二选一,template 优先
   * @returns nodemailer 的发送结果信息(messageId / response / accepted 等)
   */
  async sendMail(info: ReqEmailDto): Promise<SMTPSentMessageInfo> {
    const to = this.checkRecipient(info.to);
    const html = this.resolveHtml(info);
    let result: SMTPSentMessageInfo;
    try {
      result = await this.transporter.sendMail({
        from: this.emailConfig.smtpSender,
        to,
        subject: info.subject,
        html,
      });
    } catch (err) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}发送邮件失败: ${Utils.errMessage(err)}`,
      );
    }
    this.logger.log(
      `${this.getClientName()}邮件发送成功: to=${to.join(',')}, subject=${info.subject}, messageId=${result.messageId}`,
    );
    return result;
  }

  /**
   * 关闭传输连接(模块销毁时调用)
   */
  close(): void {
    this.transporter.close();
  }

  getClientName() {
    return `[EMAIL] 发信服务(${this.emailConfig.smtpSender}) `;
  }

  /**
   * 校验收件人并统一规整为去空、去重后的数组
   */
  private checkRecipient(to: string[] | string): string[] {
    const list = (Array.isArray(to) ? to : [to])
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
    if (list.length === 0) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        '收件人邮箱地址(to)必填且需为非空字符串或字符串数组',
      );
    }
    return [...new Set(list)];
  }

  /**
   * 解析邮件正文:传了 template 则用 EmailUtils 渲染,否则直接使用 html
   */
  private resolveHtml(info: ReqEmailDto): string {
    if (!Utils.isEmpty(info.template)) {
      // language 未传时由 EmailUtils 内部默认按中文渲染
      return this.emailUtils.getEmailTemplate(
        info.template,
        info.options ?? {},
        info.language,
      );
    }
    if (Utils.isEmpty(info.html)) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        'template 与 html 至少需要提供一个',
      );
    }
    return info.html;
  }

  /**
   * 根据邮箱配置组装 nodemailer SMTP 连接参数
   */
  private createTransportOptions(config: EmailConfig): SMTPTransportOptions {
    return {
      host: config.smtpAddress,
      port: config.smtpPort,
      secure: config.smtpPort === SMTP_SSL_PORT,
      // 未配置密码时不传 auth,兼容内网免认证的 SMTP 中继
      ...(Utils.isEmpty(config.smtpPassword)
        ? {}
        : { auth: { user: config.smtpSender, pass: config.smtpPassword } }),
    };
  }
}

/**
 * 将配置中心读取到的原始值规整为 EmailConfig(端口转数字,非法时回退默认端口)
 */
export function normalizeEmailConfig(partial: RawEmailConfig): EmailConfig {
  const port = Number(partial.smtpPort);
  return {
    smtpSender: partial.smtpSender,
    smtpAddress: partial.smtpAddress,
    smtpPassword: partial.smtpPassword,
    smtpPort: port > 0 ? port : DEFAULT_SMTP_PORT,
  };
}
