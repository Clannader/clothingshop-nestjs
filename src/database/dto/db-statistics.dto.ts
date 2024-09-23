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
   * 表的数据占用大小(kb)
   */
  dbSize: number;

  /**
   * 表的数据占用大小描述
   */
  dbSizeLabel: string;

  /**
   * 表的索引大小(kb)
   */
  dbIndexSize: number;

  /**
   * 表的索引大小描述
   */
  dbIndexSizeLabel: string;

  /**
   * 平均每个数据占用大小(kb)
   */
  avgObjSize: number;

  /**
   * 平均每个数据占用大小描述
   */
  avgObjSizeLabel: string;
}
