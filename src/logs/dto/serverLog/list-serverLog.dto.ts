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

  /**
   * 日志文件大小Label
   */
  @Expose()
  fileSizeLabel: string;

  /**
   * 创建日期的时间戳
   */
  @Expose()
  createTimeMs: number;

  /**
   * 创建日期标准格式YYYY-MM-DD
   */
  createDate: string;
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
