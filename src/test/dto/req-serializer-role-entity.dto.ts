/**
 * Create by oliver.wu 2024/10/18
 */
export class ReqSerializerRoleEntityDto {
  /**
   * 权限ID
   */
  id: number;

  /**
   * 姓名
   */
  name: string;

  constructor(partial: Partial<ReqSerializerRoleEntityDto>) {
    Object.assign(this, partial);
  }
}
