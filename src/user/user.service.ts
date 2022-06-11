import { Inject, Injectable } from '@nestjs/common';
import { AopLogger } from '../logger';
import {
  CodeEnum,
  CommonResult,
  GlobalService,
  RequestSession,
} from '../common';
import {
  ReqUserLoginDto,
  RespUserLoginDto,
  ReqUserSearchDto,
  RespUserSearchDto,
} from './dto';
import { AdminSchemaService } from '../entities';

@Injectable()
export class UserService {
  private readonly logger = new AopLogger(UserService.name);

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly adminSchemaService: AdminSchemaService

  getUsersList(params: ReqUserSearchDto): RespUserSearchDto {
    this.logger.log(params);
    const resp = new RespUserSearchDto();
    resp.code = 100;
    return resp;
  }

  async userLogin(params: ReqUserLoginDto): Promise<RespUserLoginDto> {
    const adminId = params.adminId;
    const password = params.adminPws;
    const [err, result] = await this.adminSchemaService.loginSystem(adminId).then(result => [null, result])
      .catch(err => [err])
    const resp = new RespUserLoginDto();
    if (err) {
      resp.msg = err.message;
      resp.code = err.code;
      return resp;
    }
    resp.code = CodeEnum.SUCCESS;
    return Promise.resolve(resp);
  }

  async userLogout(req: RequestSession): Promise<CommonResult> {
    await this.deleteSession(req);
    const resp = new CommonResult();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  deleteSession(req: RequestSession): Promise<void> {
    delete req.session;
    return new Promise((resolve) => {
      req.sessionStore.destroy(req.sessionID, () => {
        resolve();
      });
    });
  }
}
