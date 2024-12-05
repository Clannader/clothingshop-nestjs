/**
 * Create by CC on 2022/8/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';
import { ConfigService } from '@/common/config';
import { GlobalService, Utils } from '@/common/utils';
import { join } from 'node:path';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';
import { LanguageType, SecurityOptions } from '@/common';
import validator from 'validator';

import { SecuritySessionCacheService } from './security.session.cache.service';
import type { SecuritySessionStorage } from '@/security';
import { OnEventMessage, SendEventMessage } from '@/lib/event-message'

const publicPemName = 'public-rsa.pem';
const privatePemName = 'private-rsa.pem';
const pemDirectory = 'rsa';

export type SecretPem = {
  publicPem: string;
  privatePem: string;
  secretId: string;
};
export type TripleData = {
  tripleKey: string;
  iv: string;
};

@Injectable()
export class MemoryCacheService {
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly securitySessionCacheService: SecuritySessionCacheService;

  @SendEventMessage('asyncMemoryCache')
  async setMemoryCache(key: string, value: any) {
    await this.updateMemoryCache(key, value);
    // if (this.configService.get<boolean>('clusterServer')) {
    //   process.send({
    //     notice: 'updateMemoryCache',
    //     key,
    //     value,
    //   });
    // }
  }

  @OnEventMessage('asyncMemoryCache')
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
      const publicPath = join(this.configService.getPemPath(), publicPemName);
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
      const privatePath = join(this.configService.getPemPath(), privatePemName);
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

  // 3DES解密
  async tripleDesDecrypt(
    language: LanguageType,
    securityData: string,
    securityOptions: SecurityOptions,
  ): Promise<string> {
    const tripleData = await this.getTripleData(language, securityOptions);
    const decryptData = Utils.tripleDesDecrypt(
      securityData,
      tripleData.tripleKey,
      tripleData.iv,
    );
    if (Utils.isEmpty(decryptData)) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的密文', 'user.securityInvalid'),
      );
    }
    return Promise.resolve(decryptData);
  }

  // 3DES加密
  async tripleDesEncrypt(
    language: LanguageType,
    plainData: string,
    securityOptions: SecurityOptions,
  ) {
    const tripleData = await this.getTripleData(language, securityOptions);
    const encryptData = Utils.tripleDesEncrypt(
      plainData,
      tripleData.tripleKey,
      tripleData.iv,
    );
    return Promise.resolve(encryptData);
  }

  private async getTripleData(
    language: LanguageType,
    securityOptions: SecurityOptions,
  ): Promise<TripleData> {
    const { securityToken, securityId } = securityOptions;
    if (Utils.isEmpty(securityToken)) {
      throw new CodeException(
        CodeEnum.FAIL,
        this.globalService.lang(
          language,
          '安全凭证不能为空',
          'user.securityTokenIsEmpty',
        ),
      );
    }
    if (Utils.isEmpty(securityId)) {
      throw new CodeException(
        CodeEnum.FAIL,
        this.globalService.lang(
          language,
          '会话凭证不能为空',
          'user.securityIdIsEmpty',
        ),
      );
    }
    const securityCache: SecuritySessionStorage =
      await this.securitySessionCacheService.getSecuritySessionCache(
        securityId,
      );
    // 先判断securityId是否在服务器内
    if (Utils.isEmpty(securityCache)) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(
          language,
          '无效的会话ID',
          'user.securityIdInvalid',
        ),
      );
    }
    if (
      !Utils.isEmpty(securityCache.tripleKey) &&
      !Utils.isEmpty(securityCache.iv)
    ) {
      return {
        tripleKey: securityCache.tripleKey,
        iv: securityCache.iv,
      };
    }
    // 然后取内存值
    // 然后以内存的iv值为准解密
    const aesKey = await this.rsaPrivateDecrypt(securityToken);
    if (Utils.isEmpty(aesKey)) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的Token', 'user.tokenInvalid'),
      );
    }
    const { accessKey, vectorValue } = JSON.parse(aesKey);
    if (Utils.isEmpty(accessKey) || Utils.isEmpty(vectorValue)) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的Token', 'user.tokenInvalid'),
      );
    }
    // accessKey必须大于32位,vectorValue必须大于24位
    if (accessKey.length <= 32 - 1 || vectorValue.length <= 24 - 1) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的Token', 'user.tokenInvalid'),
      );
    }
    const tripleKey =
      accessKey.substring(0, 32) + securityCache.accessKey.substring(32, 64);
    const iv =
      vectorValue.substring(0, 12) +
      securityCache.vectorValue.substring(12, 24);
    securityCache.tripleKey = tripleKey;
    securityCache.iv = iv;
    await this.securitySessionCacheService.setSecuritySessionCache(
      securityId,
      securityCache,
    );
    return {
      tripleKey,
      iv,
    };
  }

  async removeSecuritySession(key: string): Promise<void> {
    await this.securitySessionCacheService.deleteSecuritySessionCache(key);
  }

  // 获取服务器内部最新的RSA密钥
  async getLatestRsaPem(): Promise<SecretPem> {
    let latestRsaKey = await this.getMemoryCache('latestRsaKey');
    if (Utils.isEmpty(latestRsaKey)) {
      const pemPath = this.configService.getPemPath();
      const rsaPath = join(pemPath, pemDirectory);
      if (!existsSync(rsaPath)) {
        throw new CodeException(
          CodeEnum.EXCEPTION,
          'The rsa directory does not exist',
        );
      }
      const rsaDirs = readdirSync(rsaPath);
      let createTimeMs = 0;
      for (const rsaKey of rsaDirs) {
        if (validator.isUUID(rsaKey)) {
          const statDir = statSync(join(rsaPath, rsaKey));
          if (statDir.ctimeMs > createTimeMs) {
            createTimeMs = statDir.ctimeMs;
            latestRsaKey = rsaKey;
          }
        }
      }
      await this.setMemoryCache('latestRsaKey', latestRsaKey);
    }
    return this.getInternalRsaPem(latestRsaKey);
  }

  // 通过secretId查找对应的RSA密钥
  async getInternalRsaPem(secretId: string): Promise<SecretPem> {
    if (Utils.isEmpty(secretId)) {
      throw new CodeException(CodeEnum.EXCEPTION, 'The secretId is empty');
    }
    let secretPem: SecretPem = await this.getMemoryCache(secretId);
    if (!Utils.isEmpty(secretPem)) {
      return secretPem;
    }
    const pemPath = this.configService.getPemPath();
    const secretPath = join(pemPath, pemDirectory, secretId);
    if (!existsSync(secretPath)) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        'The secretId does not exist',
      );
    }
    const publicPem = readFileSync(join(secretPath, publicPemName), 'utf8');
    const privatePem = readFileSync(join(secretPath, privatePemName), 'utf8');
    secretPem = {
      publicPem,
      privatePem,
      secretId,
    };
    await this.updateMemoryCache(secretId, secretPem);
    return Promise.resolve(secretPem);
  }
}
