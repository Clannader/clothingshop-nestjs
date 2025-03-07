/**
 * Create by oliver.wu 2025/3/7
 */
import { Expose } from 'class-transformer';

export class LogDetails {
  /**
   * 日志文件名
   */
  @Expose()
  fileName: string;

  /**
   * 日志文件大小
   */
  @Expose()
  fileSize: number;
}

export class ListServerLogDto {
  /**
   * 服务器地址名
   */
  @Expose()
  serverName: string;

  /**
   * 日志列表
   */
  logs: LogDetails[];
}
