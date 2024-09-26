import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'node:fs';
import * as nodePath from 'node:path';

import { RespWebConfigDto, WebConfigDto, RespPackageVersionDto } from '../dto';

import { ConfigService } from '@/common/config';
import { CodeEnum } from '@/common/enum';

import * as pkg from '../../../package.json';

@Injectable()
export class SystemService {
  @Inject()
  private readonly configService: ConfigService;

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
}
