/**
 * Create by oliver.wu 2024/10/11
 */
import { SequenceTypeEnum } from '@/common/enum';
import { Expose } from 'class-transformer';
import { IsDefined, IsEnum, IsString, IsOptional } from 'class-validator';

export class ReqSequenceResult {
  /**
   * 类型
   */
  @IsDefined({
    message: 'system.typeIsEmpty',
  })
  @IsEnum(SequenceTypeEnum)
  @Expose() // 必须加上这个注解才能给body获取到值
  type: SequenceTypeEnum;

  /**
   * 店铺ID,默认SYSTEM
   */
  @Expose()
  @IsOptional()
  @IsString()
  shopId?: string = 'SYSTEM';
}
