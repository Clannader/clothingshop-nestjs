/**
 * Create by oliver.wu 2024/10/18
 */
import { Exclude, Expose, Transform } from 'class-transformer';
import { ReqSerializerRoleEntityDto } from './req-serializer-role-entity.dto';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class ReqSerializerUserEntityDto {
  /**
   * 用户ID
   */
  id: number;

  /**
   * 用户名
   */
  firstName: string;

  /**
   * 用户姓
   */
  lastName: string;

  /**
   * 用户状态
   */
  @ApiProperty({
    name: 'userStatus',
    type: 'boolean',
    description: '用户状态',
  })
  @Expose({ name: 'userStatus' }) // 用这个修改响应回去的字段名
  status: boolean;

  /**
   * 密码
   */
  @ApiHideProperty() // 这个才是swagger隐藏字段的修饰器
  @Exclude() // 这个是响应时排除该字段,swagger上还是会显示该字段
  password: string;

  /**
   * 姓名全名
   */
  @Expose()
  @ApiProperty({
    name: 'fullName',
    type: 'string',
    description: '姓名全名',
  })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * 权限值
   */
  @ApiProperty({
    name: 'role',
    type: 'string',
    description: '权限值',
  })
  @Transform(({ value }) => value.name) // 对内是对象,响应回去是该对象的name属性值
  role: ReqSerializerRoleEntityDto;

  constructor(partial: Partial<ReqSerializerUserEntityDto>) {
    Object.assign(this, partial);
  }
}
