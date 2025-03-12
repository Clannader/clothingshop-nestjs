/**
 * Create by oliver.wu 2025/3/12
 */
import { Expose } from 'class-transformer';
import { ReqServerLogDownloadDto } from './req-serverLog-download.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class ReqServerLogViewDto extends ReqServerLogDownloadDto {
  /**
   * 开始字节数,默认0
   */
  @IsOptional()
  @IsNumber()
  @Expose()
  startByte?: number = 0;

  /**
   * 结束字节数,默认10kb
   */
  @IsOptional()
  @IsNumber()
  @Expose()
  endByte?: number = 10 * 1024;
}
