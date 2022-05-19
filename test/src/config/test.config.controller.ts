import { Inject, Controller, Get } from '@nestjs/common';
import { ConfigService } from '../../../src/common/config';

@Controller('/api/test')
export class TestConfigController {
  @Inject()
  private readonly configService: ConfigService;

  @Get('search')
  getIniContent() {
    return this.configService.get<number>('PORT')
  }
}
