/**
 * Create by oliver.wu 2024/9/20
 */
export class DbStatisticsDto {
  /**
   * 表名
   */
  aliasName: string;

  /**
   * 表的条目数量(count)
   */
  countSize: number;

  /**
   * 表的数据占用大小
   */
  dbSize: number;

  /**
   * 表的索引大小
   */
  dbIndexSize: number;
}