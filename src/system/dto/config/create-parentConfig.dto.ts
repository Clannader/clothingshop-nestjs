/**
 * Create by oliver.wu 2025/2/12
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateParentConfigDto {
  /**
   * 配置的KEY
   */
  @IsDefined()
  @IsString()
  @Expose()
  configKey: string;

  /**
   * 配置的值
   */
  @IsDefined()
  @IsString()
  @Expose()
  configValue: string;

  /**
   * 是否加密
   */
  @IsOptional()
  @IsBoolean()
  @Expose()
  isEncrypt?: boolean;

  /**
   * 配置的描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}
