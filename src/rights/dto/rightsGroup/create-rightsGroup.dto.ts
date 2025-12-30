/**
 * Create by oliver.wu 2025/12/30
 */
import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsString,
  IsOptional,
  Matches,
  IsArray,
} from 'class-validator';
import { groupCodeExp } from '@/common';

export class CreateRightsGroupDto {
  /**
   * 权限组名
   */
  @IsDefined()
  @IsString()
  @Matches(groupCodeExp, {
    message: 'The groupCode format ($value) is invalid',
  })
  @Expose()
  groupCode: string;

  /**
   * 权限组描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  groupName?: string;

  /**
   * 权限组包含的权限代码
   */
  @IsDefined()
  @IsArray()
  @Expose()
  rightCodes: string[];
}
