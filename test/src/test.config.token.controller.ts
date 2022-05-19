import { Inject, Controller, Get } from '@nestjs/common';
import { ConfigService } from '../../src/common/config';

@Controller('/api/test')
export class TestConfigTokenController {
  @Inject('TOKEN')
  private readonly configService: ConfigService;

  @Get('search')
  getTokenContent() {
    return this.configService.get<string>('PORT')
  }
}
