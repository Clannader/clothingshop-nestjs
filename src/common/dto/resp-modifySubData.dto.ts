/**
 * Create by oliver.wu 2026/7/15
 */
import { RespModifyDataDto } from './resp-modifyData.dto';

export class RespModifySubDataDto extends RespModifyDataDto {
  /**
   *  子文档的ID
   */
  subId: string;
}
