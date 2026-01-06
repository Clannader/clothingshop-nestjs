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
  ArrayMinSize,
} from 'class-validator';
import { groupCodeExp, singleGroupExp, shopIdExp } from '@/common';

export class CreateRightsGroupDto {
  /**
   * 店铺ID
   */
  @IsOptional()
  @IsString()
  @Matches(shopIdExp, {
    message: 'The shopId format ($value) is invalid',
  })
  @Expose()
  shopId?: string;

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
  @ArrayMinSize(1)
  @Matches(singleGroupExp, {
    each: true,
    message: (validationArguments) => {
      const args = Array.isArray(validationArguments.value)
        ? validationArguments.value.join(',')
        : '$value';
      return `The rightCodes (${args}) is invalid`;
    },
  })
  @Expose()
  rightCodes: string[];
}
