import { IsString, IsInt } from 'class-validator';
import { CommonResult } from '../../public/dto/common.dto';
import { PartialType } from '@nestjs/swagger';

export class UserSchema {
  /**
   * 用户名
   */
  @IsString()
  username: string;

  /**
   * 密码
   */
  @IsString()
  password: string;

  /**
   * 年龄
   */
  @IsInt({
    message: '年龄必须是数字',
  })
  age: number;
}

export class UserSchemaDto extends PartialType(CommonResult) {
  /**
   * 用户结构
   */
  user: UserSchema;
}
