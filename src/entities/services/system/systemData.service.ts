/**
 * Create by oliver.wu 2024/10/14
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  SystemDataModel,
  SystemData,
  TimeZoneData,
  TimeZoneDataModel,
  TimeZoneDataDocument,
} from '../../schema';
import { Utils } from '@/common/utils';

@Injectable()
export class SystemDataSchemaService {
  @InjectModel(SystemData.name)
  private readonly systemDataModel: SystemDataModel;

  @InjectModel(TimeZoneData.name)
  private readonly timeZoneDataModel: TimeZoneDataModel;

  getSystemDataModel() {
    return this.systemDataModel;
  }

  getTimeZoneDataModel() {
    return this.timeZoneDataModel;
  }

  // 同步时区数据
  syncTimeZoneObject(timeZoneInfo: TimeZoneData) {
    const where = {
      timeZone: timeZoneInfo.timeZone,
    };
    const updateObject = {
      $set: timeZoneInfo,
    };
    return this.timeZoneDataModel.findOneAndUpdate(where, updateObject, {
      upsert: true,
      select: '_id', // 返回那些字段
      returnDocument: 'after', // 返回更新之后的文档
    });
  }

  // 同步保存时区数据,避免版本号错误更新失败的问题
  async syncSaveTimeZoneObject(timeZoneDocs: TimeZoneDataDocument) {
    // 写一个方法检测如果发现save有版本号保存失败时就重新查一遍最新的版本号再次保存
    // 如果不使用该方法,则返回报错给客户端
    const [err, result] = await Utils.toPromise(timeZoneDocs.save());
    if (err) {
      // 版本更新报错,查一遍最新数据
      const [err2, newResult] = await Utils.toPromise(
        this.getTimeZoneDataModel().findById(timeZoneDocs.id, { __v: 1 }),
      );
      if (err2) {
        throw err2;
      }
      timeZoneDocs.__v = newResult.__v;
      return timeZoneDocs.save();
    }
    return result;
  }
}
