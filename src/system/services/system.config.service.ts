/**
 * Create by oliver.wu 2024/11/27
 */
import { Inject, Injectable } from '@nestjs/common';
import { GlobalService, Utils } from '@/common/utils';

import {
  ReqParentConfigDeleteDto,
  ReqParentConfigModifyDto,
  ReqSystemConfigListDto,
  RespSystemConfigCreateDto,
  RespSystemConfigListDto,
} from '../dto/config';

import { CmsSession, RespErrorResult } from '@/common';
import { CodeEnum } from '@/common/enum';

import { ParentConfigDocument } from '@/entities/schema';
import { RightsEnum } from '@/rights';

@Injectable()
export class SystemConfigService {
  @Inject()
  private readonly globalService: GlobalService;

  getSystemConfigList(params: ReqSystemConfigListDto) {
    const resp = new RespSystemConfigListDto();
    return resp;
  }

  async saveSystemParentConfig(
    session: CmsSession,
    params: ReqParentConfigModifyDto,
    isNew: boolean,
  ): Promise<RespSystemConfigCreateDto> {
    const resp = new RespSystemConfigCreateDto();

    const checkResp = await this.checkInfoSystemConfig(
      session,
      params,
      isNew,
      false,
      true,
    );

    if (!checkResp.isSuccess()) {
      resp.code = checkResp.code;
      resp.msg = checkResp.msg;
      return resp;
    }
    resp.id = checkResp.id;
    return resp;
  }

  /**
   * 校验系统配置数据以及保存数据
   * @param session 会话对象
   * @param params 编辑对象
   * @param isNew 是否是新建
   * @param isCheck 是否是仅检查
   * @param isParent 是否是一级配置
   */
  async checkInfoSystemConfig(
    session: CmsSession,
    params: ReqParentConfigModifyDto,
    isNew: boolean,
    isCheck: boolean,
    isParent: boolean,
  ) {
    const resp = new RespSystemConfigCreateDto();
    const id = params.id;
    if (!isNew && Utils.isEmpty(params.id)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        'ID值不能为空',
        'common.idIsEmpty',
      );
      return resp;
    }

    let oldParentConfig: ParentConfigDocument,
      newParentConfig: ParentConfigDocument,
      err: Error;
    if (!isNew) {
    }

    return resp;
  }

  deleteSystemConfig(session: CmsSession, params: ReqParentConfigDeleteDto) {
    const resp = new RespErrorResult();
    // 因为是统一删除一二级配置方法,所以逻辑如下:
    // 如果有groupName的,则认为是删除二级配置,并且判断有二级配置的新建和编辑权限
    // 没有groupName的，则认为删除一级配置,并且判断有一级配置的新建和编辑权限
    // 如果ids和keys都传入,则以ids为准
    const ids = params.ids;
    const keys = params.keys;
    const groupName = params.groupName;

    if (Utils.arrayIsNull(ids) && Utils.arrayIsNull(keys)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = params.keys // 如果是undefined,则提示另一个
        ? this.globalService.serverLang(
            session,
            'Keys不能为空',
            'common.keysIsEmpty',
          )
        : this.globalService.serverLang(
            session,
            'Ids不能为空',
            'common.idsIsEmpty',
          );
      return resp;
    }

    if (
      !Utils.hasOrRights(
        session,
        RightsEnum.ConfigCreate,
        RightsEnum.ConfigModify,
      )
    ) {
      resp.code = CodeEnum.NO_RIGHTS;
      resp.msg = this.globalService.serverLang(
        session,
        '用户{0}缺少所需权限{1}。',
        'common.hasNoPermissions',
        session.adminId,
        `${RightsEnum.ConfigCreate},${RightsEnum.ConfigModify}`,
      );
      return resp;
    }

    return resp;
  }
}
