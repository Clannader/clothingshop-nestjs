/**
 * Create by oliver.wu 2025/3/12
 */
import { RespServerLogDownloadDto } from './resp-serverLog-download.dto';

export class RespServerLogViewDto extends RespServerLogDownloadDto {
  /**
   * 是否还有剩余日志内容
   */
  hasMore: boolean;

  /**
   * 下一次加载的日志开始字节数
   */
  startByte: number;

  /**
   * 下一次加载的日志结束字节数
   */
  endByte: number;
}
