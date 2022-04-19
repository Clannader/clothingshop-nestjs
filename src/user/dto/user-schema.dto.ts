import { IsString, IsInt } from 'class-validator';

export class UserSchemaDto {
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
    message: '年龄必须是数字'
  })
  age: number;
}
