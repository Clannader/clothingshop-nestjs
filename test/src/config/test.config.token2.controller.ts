import { Inject, Controller, Get } from '@nestjs/common';
import { ConfigService } from '../../../src/common/config';

@Controller('/api/test')
export class TestConfigToken2Controller {
  @Inject('TOKEN')
  private readonly tokenConfigService: ConfigService;

  @Inject()
  private readonly globalConfigService: ConfigService;

  @Get('token')
  getTokenContent() {
    return {
      token: this.tokenConfigService.get<string>('PORT'),
      token2: this.globalConfigService.get<string>('PORT'),
    }
  }
}
