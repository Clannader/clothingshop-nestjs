/**
 * Create by oliver.wu 2025/3/12
 */
import { Expose } from 'class-transformer';
import { ReqServerLogDownloadDto } from './req-serverLog-download.dto';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class ReqServerLogViewDto extends ReqServerLogDownloadDto {
  /**
   * 开始字节数,默认0
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10 * 1024 * 1024)
  @Expose()
  startByte?: number = 0;

  /**
   * 结束字节数,默认10kb
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10 * 1024 * 1024)
  @Expose()
  endByte?: number = 10 * 1024;
}
