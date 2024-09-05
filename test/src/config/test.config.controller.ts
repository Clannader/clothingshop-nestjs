import { Inject, Controller, Get } from '@nestjs/common';
import { ConfigService } from '@/common/config';

@Controller('/api/test')
export class TestConfigController {
  @Inject()
  private readonly configService: ConfigService;

  @Get('search')
  getIniContent() {
    return this.configService.get<string>('PORT');
  }
}
