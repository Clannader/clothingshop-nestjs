/**
 * Create by oliver.wu 2025/5/21
 */
import { RespSystemConfigCreateDto } from './resp-systemConfig-create.dto';

export class RespSystemChildrenConfigCreateDto extends RespSystemConfigCreateDto {
  /**
   * 返回二级配置对应的一级组名
   */
  groupName: string;
}
