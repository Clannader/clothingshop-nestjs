/**
 * Create by oliver.wu 2026/11/23
 */
export interface EmailConfig {
  /** SMTP 服务器地址 */
  smtpAddress: string;
  /** SMTP 服务器端口 */
  smtpPort: number;
  /** 发件人邮箱账号 */
  smtpSender: string;
  /** 发件人邮箱密码或授权码 */
  smtpPassword: string;
}

/** 配置中心读取到的原始 SMTP 配置,端口在 ini 中可能尚未转成数字 */
export type RawEmailConfig = Partial<Omit<EmailConfig, 'smtpPort'>> & {
  smtpPort?: number | string;
};
