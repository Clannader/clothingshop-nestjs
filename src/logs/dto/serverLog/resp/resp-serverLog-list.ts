/**
 * Create by oliver.wu 2025/3/7
 */
import { ListServerLogDto } from '../list-serverLog.dto';
import { CommonResult } from '@/common';

export class RespServerLogList extends CommonResult {
  /**
   * 服务器列表
   */
  serverLogs: ListServerLogDto[];
}
