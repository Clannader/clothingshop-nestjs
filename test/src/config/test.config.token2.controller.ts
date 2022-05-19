import { Inject, Controller, Get } from '@nestjs/common';
import { ConfigService } from '../../../src/common/config';

@Controller('/api/test')
export class TestConfigToken2Controller {
  @Inject('TOKEN')
  private readonly configService: ConfigService;

  @Inject()
  private readonly configService2: ConfigService;

  @Get('token')
  getTokenContent() {
    return {
      token: this.configService.get<string>('PORT'),
      token2: this.configService2.get<string>('PORT'),
    }
  }
}
