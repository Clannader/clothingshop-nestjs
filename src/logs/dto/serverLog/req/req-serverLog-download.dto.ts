/**
 * Create by oliver.wu 2025/3/12
 */
import { Expose } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { ServerLogViewEnum } from '@/common/enum';
import { ApiHideProperty } from '@nestjs/swagger';

export class ReqServerLogDownloadDto {
  /**
   * 服务器名,例如Server1,Server2,Server3...
   */
  @Expose()
  @IsString()
  @Matches(/^Server[1-9]$/)
  serverName: string;

  /**
   * 查看类型,默认View
   */
  @ApiHideProperty()
  viewType: ServerLogViewEnum = ServerLogViewEnum.View;

  /**
   * 日志文件名
   */
  @Expose()
  @IsString()
  @Matches(/^server.log.\d{4}-\d{2}-\d{2}$/, {
    message: 'The fileName $value is invalid',
  })
  logName: string;
}
