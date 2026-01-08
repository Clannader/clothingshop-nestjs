/**
 * Create by oliver.wu 2026/1/8
 */
import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsString, IsMongoId } from 'class-validator';
import { Utils } from '@/common/utils';

export class ReqRightsGroupSingleDto {
  /**
   * 店铺ID
   */
  @IsOptional()
  @IsString()
  @Expose()
  @Transform(({ value }) => value ?? Utils.SYSTEM)
  shopId: string = Utils.SYSTEM;

  /**
   * 搜索权限组描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  groupCode?: string;

  /**
   * 权限组ID
   */
  @IsOptional()
  @IsString()
  @IsMongoId()
  @Expose()
  id?: string;
}
