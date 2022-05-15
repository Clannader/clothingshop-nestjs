import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  Query,
  Inject,
  // Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApiCommon,
  ApiCustomResponse,
  CodeEnum,
  ConfigService,
  GlobalService,
} from '../common';
import { ReqTestSchemaDto, RespTestSchemaDto } from './dto';
// import { UserService } from '../user/user.service';

@ApiCommon()
@Controller('/cms/api/test')
@ApiTags('TestController')
export class TestController {
  @Inject()
  private readonly globalService: GlobalService;

  // @Inject()
  // private readonly userService: UserService;

  @Inject()
  private readonly configService: ConfigService;

  // @Inject('TEST_CONFIG')
  // private readonly config2Service: ConfigService;

  @Post('/post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试 POST 泛型接口',
    description: '测试泛型接口',
  })
  @ApiCustomResponse({
    type: RespTestSchemaDto,
  })
  async testingPost(
    @Body() params: ReqTestSchemaDto
    // @Headers('language') lang: string,
  ) {
    const resp = new RespTestSchemaDto();
    // const dbUser: string = this.configService.get<string>('dbUser');
    // console.log(dbUser);
    // console.log(typeof dbUser);
    // console.log(this.configService.getSecurityConfig('dbUrl'))
    // console.log(this.configService.getSecurityConfig('mailPws'))
    // const httpPort: number = this.configService.get<number>('httpPort');
    // console.log(httpPort);
    // console.log(typeof httpPort);
    // const printUrl: boolean = this.configService.get<boolean>(
    //   'printUrl',
    //   false,
    // );
    // console.log(printUrl);
    // console.log(typeof printUrl);
    // this.configService.set('aaa', 8989);
    // this.configService.set('aaa2', '4324rer');
    // this.configService.set('aaa4', false);
    // console.log(this.configService.get<boolean>('monitorLog'));
    // console.log(this.configService.getInternalConfig());
    //
    // console.log(this.config2Service.get<boolean>('monitorLog'));
    // this.config2Service.set('config2', '成功了');
    // console.log(this.config2Service.getInternalConfig());
    // console.log(this.configService.getInternalConfig())
    // this.configService.set<boolean>('boolean', false)
    // this.configService.set<number>('number', 120)
    // this.configService.set<string>('string', '4578')
    // this.configService.set('boolean2', false)
    // this.configService.set('number2', 120)
    // this.configService.set('string2', 'trtgfsgf')

    // const fun = function() {
    //   return new Promise(resolve => {
    //     setTimeout(() => {
    //       // this.userService.userLogout()
    //       resolve('123')
    //     }, 3000)
    //   })
    // }
    // console.log(this.globalService.serverLang('测试', 'user.userTest'))
    // if (lang === 'EN') {
    //   await fun()
    //   this.userService.userLogout()
    // }
    // console.log(this.globalService.serverLang('测试', 'user.userTest'))
    // const isColorAllowed = () => !process.env.NO_COLOR;
    console.log(this.configService.getSecurityConfig('dbUrl'))
    console.log(typeof process.env['NO_COLOR'])
    console.log(process.env['NO_COLOR'])
    // console.log(isColorAllowed() ? 'true' : 'false')
    console.log(process.env['NODE_ENV'])
    resp.code = CodeEnum.SUCCESS;
    resp.rows = 23;
    return resp;
  }

  @Get('/get')
  @ApiOperation({
    summary: '测试 GET 泛型接口',
    description: '测试泛型接口',
  })
  @ApiCustomResponse({
    type: RespTestSchemaDto,
  })
  testingGet(@Query() params: ReqTestSchemaDto) {
    console.log(params);
    const resp = new RespTestSchemaDto();
    resp.code = CodeEnum.SUCCESS;
    resp.rows = 23;
    resp.schema = params.testObject;
    return resp;
  }
}
