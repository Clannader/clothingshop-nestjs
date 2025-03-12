/**
 * Create by oliver.wu 2025/3/12
 */
import { Expose } from 'class-transformer';
import { ReqServerLogDownloadDto } from './req-serverLog-download.dto';
import { IsNumber } from 'class-validator';

export class ReqServerLogViewDto extends ReqServerLogDownloadDto {
  /**
   * 开始字节数
   */
  @Expose()
  @IsNumber()
  startByte: number;

  /**
   * 结束字节数
   */
  @Expose()
  @IsNumber()
  endByte: number;
}
