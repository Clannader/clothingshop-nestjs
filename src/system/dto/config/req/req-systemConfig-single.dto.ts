/**
 * Create by oliver.wu 2025/8/6
 */
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ReqSystemConfigSingleDto {
  /**
   * 父级的组名,有该值才会查二级配置,否则默认一级配置
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

  /**
   * 唯一ID值
   */
  @Expose()
  @IsOptional()
  @IsString()
  id?: string;
}
