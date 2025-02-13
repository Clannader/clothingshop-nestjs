/**
 * Create by oliver.wu 2025/2/13
 */
import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ReqParentConfigDeleteDto {
  /**
   * 配置的ID号列表
   */
  @IsOptional()
  @IsArray()
  @Expose()
  ids: string[];

  /**
   * 父级的组名,删除时如果传入该值说明删除二级配置
   */
  @IsOptional()
  @IsString()
  @Expose()
  groupName: string;

  /**
   * 配置的KEY值列表
   * 如果不传groupName,那么删除一级配置,通过keys或者ids
   * 如果传groupName,那么删除二级配置,通过keys或者ids
   */
  @IsOptional()
  @IsArray()
  @Expose()
  keys: string[];
}
