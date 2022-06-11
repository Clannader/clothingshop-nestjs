import { CommonResult } from '@/common';
import { UserSchemaDto } from '../user-schema.dto';

export class RespUserSearchDto extends CommonResult {
  /**
   * 总数
   */
  total: number;

  /**
   * 用户列表
   */
  users: UserSchemaDto[];
}
