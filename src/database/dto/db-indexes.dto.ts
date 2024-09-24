/**
 * Create by oliver.wu 2024/9/20
 */
import { DbIndexType } from '@/common/enum';

export class DbIndexesDto {
  /**
   * 数据库表别名
   */
  aliasName: string;

  /**
   * 索引名
   */
  indexName: string;

  /**
   * 索引参数
   */
  indexOptions: Record<string, any>;

  /**
   * 索引字段
   */
  indexFields: Record<string, any>;

  /**
   * 索引状态
   * 0:异常(系统默认必要索引,但在数据库中未建立) 1:正常(系统默认索引和数据库索引一致) 2:差异(系统没有设置该索引,但是数据库中有该索引)
   */
  indexStatus: DbIndexType;
}
