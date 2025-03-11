/**
 * Create by oliver.wu 2025/3/7
 */
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class ReqServerLogListDto {
  /**
   * 查询大于等于某天的所有日志,格式YYYY-MM-DD
   */
  @IsOptional()
  @IsString()
  @IsDateString(
    {
      strict: true,
    },
    {
      message: '$property must be a valid YYYY-MM-DD date string',
    },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '$property must be a valid YYYY-MM-DD date string',
  })
  @Expose()
  // TODO 新增日期格式校验
  date?: string;
}
