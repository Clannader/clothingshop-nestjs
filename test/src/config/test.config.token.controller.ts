import { Inject, Controller, Get } from '@nestjs/common';
import { ConfigService } from '../../../src/common/config';

@Controller('/api/test')
export class TestConfigTokenController {
  @Inject('TOKEN')
  private readonly tokenConfigService: ConfigService;

  @Inject()
  private readonly globalConfigService: ConfigService;

  @Get('token')
  getTokenContent() {
    return {
      token: this.tokenConfigService.get<string>('PORT'),
      global: this.globalConfigService.get<string>('PORT'),
    };
  }
}
