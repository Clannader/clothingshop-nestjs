/**
 * Create by oliver.wu 2024/11/27
 */
import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ReqSystemConfigListDto {
  /**
   * 是否包含子级返回,默认只返回父级数据
   */
  @Expose()
  @IsOptional()
  // @IsString()
  // @Matches(/^(true|false)$/, {
  //   message: '$property must be a boolean value',
  // })
  @Transform(({ value }) => value === 'true')
  // @IsEnum(SystemConfigTypeEnum)
  includeChildren?: boolean = false;

  /**
   * 父级的组名
   */
  @Expose()
  @IsOptional()
  @IsString()
  groupName?: string;

  /**
   * 配置的KEY
   */
  @Expose()
  @IsOptional()
  @IsString()
  configKey?: string;
}
