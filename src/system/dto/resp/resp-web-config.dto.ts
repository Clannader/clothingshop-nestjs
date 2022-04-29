import { WebConfigDto } from '../web-config.dto';
import { CommonResult } from '../../../public/dto/common.dto';

export class RespWebConfigDto extends CommonResult{
  /**
   * 系统配置
   */
  config: WebConfigDto;
}
