/**
 * Create by oliver.wu 2024/10/18
 */
import { Exclude, Expose, Transform } from 'class-transformer';
import { ReqSerializerRoleEntityDto } from './req-serializer-role-entity.dto';

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

  @Exclude()
  password: string;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Transform(({ value }) => value.name)
  role: ReqSerializerRoleEntityDto;

  constructor(partial: Partial<ReqSerializerUserEntityDto>) {
    Object.assign(this, partial);
  }
}
