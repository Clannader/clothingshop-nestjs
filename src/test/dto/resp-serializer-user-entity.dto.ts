/**
 * Create by oliver.wu 2024/10/18
 */
import { CommonResult } from '@/common';
import { ReqSerializerUserEntityDto } from './req-serializer-user-entity.dto';

export class RespSerializerUserEntityDto extends CommonResult {
  /**
   * 用户信息
   */
  user: ReqSerializerUserEntityDto;
}
