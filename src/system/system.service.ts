import { Injectable } from '@nestjs/common';
import { RespWebConfigDto } from './dto/resp/resp-web-config.dto';
import { WebConfigDto } from './dto/web-config.dto';
import { CodeEnum } from '../public/enum/common.enum';

@Injectable()
export class SystemService {

  getSystemConfig(): RespWebConfigDto {
    const resp = new RespWebConfigDto();

    const config = new WebConfigDto();
    config.dateFormat = 'yyyy/MM/dd';
    config.version = '1.0.0';
    config.author = 'oliver.wu';
    config.copyright = '2022';

    resp.config = config;
    resp.code = CodeEnum.SUCCESS;

    return resp;
  }
}
