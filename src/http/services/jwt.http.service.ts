/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Utils } from '@/common/utils';
import { CommonResult } from '@/common';
import { CodeEnum } from '@/common/enum';
import * as crypto from 'node:crypto';

@Injectable()
export class JwtHttpService extends HttpAbstractService {
  initInterceptor() {
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.httpServiceCacheService.getServiceToken(
          this.options,
        );
        if (Utils.isEmpty(config.headers['Authorization'])) {
          config.headers['Authorization'] =
            'Bearer ' + (token?.accessToken ?? '');
        }
        config.headers['language'] = this.session?.language ?? 'ZH'; // 后期再考虑翻译吧
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  responseResult(
    targetRequest: Observable<AxiosResponse>,
    respData: AxiosResponse,
  ): Promise<AxiosResponse> {
    const data: CommonResult = respData.data;
    const code = data.code;
    if (!Utils.isEmpty(code)) {
      if (CodeEnum.INVALID_TOKEN === code) {
        // 无效的登录,需要重新登录
        return this.loginAction(targetRequest);
      } else if (CodeEnum.TOKEN_EXPIRED === code) {
        // token无效需要刷新
        return this.refreshToken(targetRequest);
      }
    }
    return Promise.resolve(respData);
  }

  private async loginAction(targetRequest: Observable<AxiosResponse>) {
    const publicKey = await this.getPublicKey();
    const sessionStorage = await this.getSecuritySession();
    const tripleKey = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(12).toString('hex');
    const triplePassword = Utils.tripleDesEncrypt(
      this.options.password,
      tripleKey.substring(32) + sessionStorage?.accessKey?.substring(32),
      iv.substring(12) + sessionStorage?.vectorValue?.substring(12),
    );
    const tokenParams = {
      accessKey: tripleKey,
      vectorValue: iv,
    };
    const securityToken = Utils.rsaPublicEncrypt(
      JSON.stringify(tokenParams),
      publicKey,
    );
    const loginParams = {
      adminId: this.options.userName,
      adminPws: triplePassword,
    };
    // TODO 这里还缺少重试的次数,报错最多重试3次
    const loginObservable = this.makeObservable(
      this.service.post,
      '/gateway/api/oauth/authorize',
      loginParams,
      {
        headers: {
          'security-token': securityToken,
          'security-id': sessionStorage?.sessionId,
        },
      },
    );
    const [err, result] = await Utils.toPromise(
      firstValueFrom(loginObservable),
    );
    if (err) {
      return Promise.reject(err);
    }
    const respData = result.data;
    if (CodeEnum.SUCCESS !== respData.code) {
      // TODO 这个错误需要重新思考处理,如果密码错误时
      return Promise.reject(result);
    }
    await this.httpServiceCacheService.setServiceToken(this.options, {
      accessToken: result.data['accessToken'],
      refreshToken: result.data['refreshToken'],
    });
    return this.requestToPromise(targetRequest);
  }

  private async refreshToken(targetRequest: Observable<AxiosResponse>) {
    const refreshParams = {
      refreshToken:
        (await this.httpServiceCacheService.getServiceToken(this.options))
          ?.refreshToken ?? '',
    };
    const refreshObservable = this.makeObservable(
      this.service.post,
      '/gateway/api/oauth/refreshToken',
      refreshParams,
    );
    const [err, result] = await Utils.toPromise(
      firstValueFrom(refreshObservable),
    );
    if (err) {
      return Promise.reject(err);
    }
    // TODO 需要判断返回的结果是否正确才能存缓存
    // 判断code是否成功,token是否有效和是否过期才能set到缓存中
    // 如果刷新token时,token无效则去登录
    const respData = result.data;
    const code = respData.code;
    if (CodeEnum.INVALID_TOKEN === code || CodeEnum.TOKEN_EXPIRED === code) {
      // 无效的登录,需要重新登录
      return this.loginAction(targetRequest);
    }
    await this.httpServiceCacheService.setServiceToken(this.options, {
      accessToken: result.data['accessToken'],
      refreshToken: result.data['refreshToken'],
    });
    return this.requestToPromise(targetRequest);
  }
}
