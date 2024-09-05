import { Inject, Controller, Get } from '@nestjs/common';
import { ConfigService } from '@/common/config';

@Controller('/api/test')
export class TestConfigTokenController {
  @Inject('TOKEN')
  private readonly tokenConfigService: ConfigService;

  @Inject()
  private readonly globalConfigService: ConfigService;

  @Get('token')
  getTokenContent() {
    return {
      token: this.tokenConfigService.get<number>('PORT'),
      global: this.globalConfigService.get<number>('PORT'),
    };
  }
}
