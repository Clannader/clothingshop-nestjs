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
} from '../../schema';

@Injectable()
export class SystemDataSchemaService {
  @InjectModel(SystemData.name)
  private systemDataModel: SystemDataModel;

  @InjectModel(TimeZoneData.name)
  private timeZoneDataModel: TimeZoneDataModel;

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
      // select: '_id', // 返回那些字段
      returnDocument: 'after', // 返回更新之后的文档
    });
  }
}
