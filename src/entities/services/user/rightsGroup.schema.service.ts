/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RightsGroupModel, RightsGroup } from '../../schema';
import { RightsGroupList, getAllRightsCode } from '@/rights';

@Injectable()
export class RightsGroupSchemaService {
  @InjectModel(RightsGroup.name)
  private readonly rightsGroupModel: RightsGroupModel;

  private defaultGroupMap: Map<string, Array<string>> = new Map()

  getModel() {
    return this.rightsGroupModel;
  }

  /**
   * 获取默认权限组信息
   */
  getDefaultRightsGroup() {
    if (this.defaultGroupMap.size === 0) {
      RightsGroupList.forEach((item) => {
        this.defaultGroupMap.set(item.groupCode, item.rightCodes)
      })
    }
    return this.defaultGroupMap;
  }

  getAllRightsCode() {
    return getAllRightsCode()
  }
}
