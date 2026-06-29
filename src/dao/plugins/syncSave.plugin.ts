/**
 * Create by oliver.wu 2026/1/4
 */
import { HydratedDocument, Schema } from 'mongoose';
import { Utils } from '@/common/utils';

export const syncSavePlugin = function (schema: Schema): void {
  schema.statics.syncSaveDBObject = async function <T extends Schema>(
    dbDataDocs: HydratedDocument<T>,
  ): Promise<HydratedDocument<T>> {
    const [err, result] = await Utils.toPromise(dbDataDocs.save());
    // 获取更新版本的字段名'__v'
    const versionKey: string = schema.get('versionKey') as string;
    if (err) {
      // 版本更新报错,查一遍最新数据
      const [err2, newResult] = await Utils.toPromise<HydratedDocument<T>>(
        this.findById(dbDataDocs.id, { [versionKey]: 1 }),
      );
      if (err2) {
        throw err2;
      }
      dbDataDocs[versionKey] = newResult[versionKey];
      return dbDataDocs.save();
    }
    return result;
  };
};
