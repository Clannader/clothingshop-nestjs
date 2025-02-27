import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Req,
  UseInterceptors,
  UseGuards,
  Inject,
  Headers,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  CommonResult,
  RequestSession,
  LoginResult,
  LanguageType,
  RespPublicKeyResultDto,
  RespSecuritySessionDto,
  SecurityOptions,
} from '@/common';
import { CodeEnum } from '@/common/enum';
import {
  ApiCommon,
  ApiCustomResponse,
  UserLanguage,
  ApiTagsController,
} from '@/common/decorator';
import { UserService } from '@/user';
import { ReqUserLoginDto, RespUserLoginDto } from '@/user/dto';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { MemoryCacheService } from '@/cache/services';
import { SecuritySessionService, SecuritySessionStorage } from '@/security';

@Controller('/cms/api/user')
@ApiTagsController('LoginController', '登录模块')
export class LoginController {
  @Inject()
  private readonly userService: UserService;

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  @Inject()
  private readonly securitySessionService: SecuritySessionService;

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '登录系统',
    description: '获取系统的凭证',
  })
  @ApiCustomResponse({
    type: RespUserLoginDto,
  })
  @ApiCommon({
    showCredential: false,
    showRsaToken: true,
    rsaTokenRequired: true,
  })
  async userLogin(
    @Body() params: ReqUserLoginDto,
    @Req() req: RequestSession,
    @UserLanguage() language: LanguageType,
    @Headers('Security-Token') securityToken: string,
    @Headers('Security-Id') securityId: string,
  ) {
    const securityOptions: SecurityOptions = {
      securityToken,
      securityId,
    };
    const result: LoginResult = await this.userService.userLogin(
      language,
      params,
      securityOptions,
    );
    const resp = new RespUserLoginDto();
    if (result.code !== CodeEnum.SUCCESS) {
      resp.code = result.code;
      resp.msg = result.message;
      return resp;
    }
    return this.userService.regenerateUserSession(req, result);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '退出系统',
    description: '删除系统的凭证',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiCommon()
  @UseGuards(SessionGuard)
  @UseInterceptors(HttpInterceptor)
  userLogout(@Req() req: RequestSession) {
    return this.userService.userLogout(req);
  }

  @Get('/publicKey')
  @ApiOperation({
    summary: '获取系统公钥',
    description: '获取系统公钥',
  })
  @ApiCustomResponse({
    type: RespPublicKeyResultDto,
  })
  @ApiCommon({ showCredential: false })
  async getUserPublicKey() {
    const resp = new RespPublicKeyResultDto();
    resp.publicKey = await this.memoryCacheService.getRsaPublicKey();
    return resp;
  }

  @Post('/getSecuritySession')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取一个安全会话',
    description: '获取安全会话的相关数据',
  })
  @ApiCustomResponse({
    type: RespSecuritySessionDto,
  })
  @ApiCommon({ showCredential: false })
  async getUserSecuritySession() {
    const storage: SecuritySessionStorage =
      await this.securitySessionService.getNewSessionStorage();
    const resp = new RespSecuritySessionDto();
    resp.sessionId = storage.sessionId;
    resp.accessKey = storage.accessKey;
    resp.vectorValue = storage.vectorValue;
    return resp;
  }
}
