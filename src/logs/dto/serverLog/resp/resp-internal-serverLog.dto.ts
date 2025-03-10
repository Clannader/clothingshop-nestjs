/**
 * Create by oliver.wu 2025/3/7
 */
import { LogDetails } from '../list-serverLog.dto';
import { CommonResult } from '@/common';

export class RespInternalServerLogDto extends CommonResult {
  /**
   * 单个服务器查询返回的日志列表
   */
  logs: LogDetails[];
}
