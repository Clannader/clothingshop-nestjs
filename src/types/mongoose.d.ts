/**
 * Create by oliver.wu 2026/1/4
 */
// src/types/mongoose.d.ts
import 'mongoose';

declare module 'mongoose' {
  interface Model {
    // 根据你的方法签名调整参数/返回类型
    syncSaveDBObject<T extends HydratedDocument>(
      dbDataDocs: HydratedDocument<T>,
    ): Promise<HydratedDocument<T>>;
  }
}
