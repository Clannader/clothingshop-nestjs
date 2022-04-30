export class ReqPageSchemaDto {
  /**
   * 查询条件,按空格分隔可查询多个条件
   */
  condition?: string;

  /**
   * 页码
   * @default 1
   */
  offset?: number = 1;

  /**
   *
   */
  pageSize = 30;

  /**
   *
   */
  sortOrder: Map<string, number>;
}
