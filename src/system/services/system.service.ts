import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'node:fs';
import * as nodePath from 'node:path';

import {
  RespWebConfigDto,
  WebConfigDto,
  RespPackageVersionDto,
  RespSequenceResult,
  ReqSequenceResult,
} from '../dto';

import { ConfigService } from '@/common/config';
import { CodeEnum, SequenceTypeEnum } from '@/common/enum';
import { SequenceSchemaService } from '@/entities/services';

import * as pkg from '../../../package.json';
import { GlobalService, Utils } from '@/common/utils';
import { CmsSession } from '@/common';

@Injectable()
export class SystemService {
  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly sequenceSchemaService: SequenceSchemaService;

  @Inject()
  private readonly globalService: GlobalService;

  getSystemConfig(): RespWebConfigDto {
    const resp = new RespWebConfigDto();

    const config = new WebConfigDto();
    config.dateFormat = 'yyyy/MM/dd';
    config.version = pkg.version; // this.configService.get<string>('version', '1.0.0');
    config.author = this.configService.get<string>('author', 'Oliver.wu');
    config.copyright = this.configService
      .get<string>('copyright', '2022')
      .toString();

    resp.config = config;
    resp.code = CodeEnum.SUCCESS;

    return resp;
  }

  getPackageVersion(): RespPackageVersionDto {
    const resp = new RespPackageVersionDto();

    const modulesPackage = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    const version = {};

    const getModulesVersion = (pkgName: string) => {
      const modulePath = nodePath.resolve(
        process.cwd(),
        'node_modules',
        pkgName,
      ); // 获取依赖包模块的绝对路径
      const packageJsonPath = nodePath.join(modulePath, 'package.json'); // 构建package.json文件的路径

      if (!fs.existsSync(packageJsonPath)) {
        return modulesPackage[pkgName];
      }
      const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8'); // 读取package.json文件的内容
      const packageJson = JSON.parse(packageJsonContent); // 将内容解析为JSON对象

      return packageJson.version; // 获取版本号
    };

    for (const pkgName in modulesPackage) {
      version[pkgName] = getModulesVersion(pkgName);
    }

    resp.code = CodeEnum.SUCCESS;
    resp.version = version;

    return resp;
  }

  async getSequenceNumber(session: CmsSession, params: ReqSequenceResult) {
    const resp = new RespSequenceResult();
    const type = params.type;
    const shopId = params.shopId;
    if (Utils.isEmpty(type)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '类型不能为空',
        'system.typeIsEmpty',
      );
      return resp;
    }
    const typeArray = Utils.enumToArray(SequenceTypeEnum)[1];
    if (!typeArray.includes(type)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '类型必须在以下值中选其一:{0}',
        'system.typeIsEnum',
        typeArray.join(','),
      );
      return resp;
    }
    // TODO 以后估计要限制shopId的值必须在用户的管理范围内
    const [err, result] = await Utils.toPromise(
      this.sequenceSchemaService.getNextSequence(type, shopId),
    );
    if (err) {
      resp.code = err.code;
      resp.msg = err.message;
      return resp;
    }
    resp.sequenceNumber = result.sequenceId;
    resp.type = type;
    return resp;
  }
}
