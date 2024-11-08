/**
 * Create by CC on 2022/8/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';
import { ConfigService } from '@/common/config';
import { GlobalService, Utils } from '@/common/utils';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';
import { LanguageType } from '@/common';

@Injectable()
export class MemoryCacheService {
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly globalService: GlobalService;

  async setMemoryCache(key: string, value: any) {
    await this.updateMemoryCache(key, value);
    if (this.configService.get<boolean>('clusterServer')) {
      process.send({
        notice: 'updateMemoryCache',
        key,
        value,
      });
    }
  }

  async updateMemoryCache(key: string, value: any) {
    await this.cacheManager.set(key, value);
  }

  getMemoryCache(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  getAllCacheKeys() {
    return this.cacheManager.store.keys();
  }

  async getRsaPublicKey(): Promise<string> {
    return Utils.stringToBase64(await this.getRsaPublicPem());
  }

  async getRsaPublicPem(): Promise<string> {
    const pemKey = 'rsa-public-pem';
    let pem = await this.getMemoryCache(pemKey);
    if (Utils.isEmpty(pem)) {
      const publicPath = join(
        this.configService.getPemPath(),
        'public-rsa.pem',
      );
      if (existsSync(publicPath)) {
        pem = readFileSync(publicPath, 'utf8');
      }
      await this.updateMemoryCache(pemKey, pem);
    }
    return pem;
  }

  async getRsaPrivatePem(): Promise<string> {
    const pemKey = 'rsa-private-pem';
    let pem = await this.getMemoryCache(pemKey);
    if (Utils.isEmpty(pem)) {
      const privatePath = join(
        this.configService.getPemPath(),
        'private-rsa.pem',
      );
      if (existsSync(privatePath)) {
        pem = readFileSync(privatePath, 'utf8');
      }
      await this.updateMemoryCache(pemKey, pem);
    }
    return pem;
  }

  // 正常逻辑不会在服务器端使用私钥加密或者公钥加密,所以只有使用私钥解密了
  async rsaPrivateDecrypt(data: string) {
    return Utils.rsaPrivateDecrypt(data, await this.getRsaPrivatePem());
  }

  async tripleDesDecrypt(
    language: LanguageType,
    securityData: string,
    securityToken: string,
  ): Promise<string> {
    const aesKey = await this.rsaPrivateDecrypt(securityToken);
    if (Utils.isEmpty(aesKey)) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的Token', 'user.tokenInvalid'),
      );
    }
    const { accessKey, vectorValue } = JSON.parse(aesKey);
    const decryptData = Utils.tripleDesDecrypt(
      securityData,
      accessKey,
      vectorValue,
    );
    if (Utils.isEmpty(decryptData)) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的密文', 'user.securityInvalid'),
      );
    }
    return Promise.resolve(decryptData);
  }
}
