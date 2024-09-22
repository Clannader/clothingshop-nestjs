import { Injectable, Inject } from '@nestjs/common';
import { RespWebConfigDto, WebConfigDto } from './dto';
import { ConfigService } from '@/common/config';
import { CodeEnum } from '@/common/enum';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Collection, Model } from 'mongoose';

type ModelMap = {
  modelName: string;
  collectionName: string;
};

interface CustomCollection extends Collection {
  modelName: string;
}

interface CustomModel extends Model<any> {
  getAliasName(): string;
}

@Injectable()
export class SystemService {
  @Inject()
  private readonly configService: ConfigService;

  @InjectConnection()
  private readonly mongooseConnection: Connection;

  async getSystemConfig() {
    const resp = new RespWebConfigDto();

    const config = new WebConfigDto();
    config.dateFormat = 'yyyy/MM/dd';
    config.version = this.configService.get<string>('version', '1.0.0');
    config.author = this.configService.get<string>('author', 'Oliver.wu');
    config.copyright = this.configService
      .get<string>('copyright', '2022')
      .toString();

    resp.config = config;
    resp.code = CodeEnum.SUCCESS;

    // 这个是数据库总的状态
    // const stats = await this.mongooseConnection.db.stats()
    // console.log(stats)

    // 这个是数据库总的信息
    // const serverInfo = await this.mongooseConnection.db.admin().serverInfo()
    // console.log(serverInfo)

    const modelMap = this.getModelMap()
    for (const [aliasName, modelInfo] of modelMap) {
      // console.log(aliasName)
      const name = modelInfo.collectionName
      const collStats = await this.mongooseConnection.collection(name).stats()
      console.log(`ns: ${collStats.ns}`)
      console.log(`size: ${collStats.size}`)
      console.log(`storageSize: ${collStats.storageSize}`)
      console.log(`count: ${collStats.count}`)
      console.log(`avgObjSize: ${collStats.avgObjSize}`)
    }

    return resp;
  }

  private getModelMap(): Map<string, ModelMap> {
    const modelMap = new Map<string, ModelMap>();
    const collections = this.mongooseConnection.collections; // 所有连接名
    for (const collection in collections) {
      const value = collections[collection] as CustomCollection;
      const modelName = value.modelName;
      const aliasName = (
        this.mongooseConnection.models[modelName] as CustomModel
      ).getAliasName();
      modelMap.set(aliasName, {
        collectionName: value.collectionName,
        modelName,
      });
    }
    return modelMap;
  }
}
