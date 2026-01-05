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
    if (err) {
      // 版本更新报错,查一遍最新数据
      const [err2, newResult] = await Utils.toPromise<HydratedDocument<T>>(
        this.findById(dbDataDocs.id, { __v: 1 }),
      );
      if (err2) {
        throw err2;
      }
      dbDataDocs.__v = newResult.__v;
      return dbDataDocs.save();
    }
    return result;
  };
};
