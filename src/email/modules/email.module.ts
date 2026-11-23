/**
 * Create by oliver.wu 2026/11/23
 */
import { Module, OnModuleDestroy } from '@nestjs/common';
import { EmailService, normalizeEmailConfig } from '../services';
import { EmailUtils } from '../email.utils';
import { ConfigService } from '@/common/config';
import { GLOBAL_CONFIG } from '@/common';

@Module({
  providers: [
    EmailUtils,
    {
      provide: EmailService,
      inject: [GLOBAL_CONFIG, EmailUtils],
      useFactory: (configService: ConfigService, emailUtils: EmailUtils) =>
        new EmailService(
          // SMTP 连接信息与 mqtt/db 的先例一致,统一走加密配置读取
          normalizeEmailConfig({
            smtpSender: configService.getSecurityConfig('smtpSender'),
            smtpAddress: configService.getSecurityConfig('smtpAddress'),
            smtpPassword: configService.getSecurityConfig('smtpPassword'),
            smtpPort: configService.get<number>('smtpPort'),
          }),
          emailUtils,
        ),
    },
  ],
  exports: [EmailService],
})
export class EmailModule implements OnModuleDestroy {
  constructor(private readonly emailService: EmailService) {}

  onModuleDestroy(): void {
    this.emailService.close();
  }
}
