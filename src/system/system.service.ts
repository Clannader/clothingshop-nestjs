import { Injectable, Inject } from '@nestjs/common';
import { RespWebConfigDto, WebConfigDto } from './dto';
import { CodeEnum, ConfigService } from '@/common';

@Injectable()
export class SystemService {
  @Inject()
  private readonly configService: ConfigService;

  getSystemConfig(): RespWebConfigDto {
    const resp = new RespWebConfigDto();

    const config = new WebConfigDto();
    config.dateFormat = 'yyyy/MM/dd';
    config.version = this.configService.get<string>('version', '1.0.0');
    config.author = this.configService.get<string>('author', 'Oliver.wu');
    config.copyright = this.configService.get<string>('copyright', '2022');

    resp.config = config;
    resp.code = CodeEnum.SUCCESS;

    return resp;
  }
}
