import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCommon,
  CodeEnum,
  ConfigService,
  GlobalService,
  ApiGenericsResponse,
  XmlData,
  XmlJsonData,
} from '@/common';
import {
  ReqTestSchemaDto,
  RespTestSchemaDto,
  TestSchemaDto,
  RespObjectDto,
} from './dto';
// import { cloneClass } from './utils/test.utils';
import { UserSessionDto } from '@/user';
import { XmlInterceptor } from '@/interceptor';

// import { UserService } from '../user/user.service';

@ApiCommon()
@Controller('/cms')
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

  @Post('/gateway/test/post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试 POST 泛型接口',
    description: '测试泛型接口',
  })
  @ApiGenericsResponse(RespTestSchemaDto, TestSchemaDto)
  @UseInterceptors(XmlInterceptor)
  async testingPost(
    @Body() params: ReqTestSchemaDto,
    @XmlData() xmlData: string,
    @XmlJsonData() xmlJsonData: Record<string, any>,
    // @Headers('language') lang: string,
  ) {
    const resp = new RespTestSchemaDto();
    resp.result = new TestSchemaDto();
    console.log(params);
    console.log(xmlData);
    console.log(xmlJsonData);
    // const clone = cloneClass(RespTestSchemaDto);
    // console.log(Reflect.getMetadataKeys(clone));
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
    // console.log(this.configService.get<boolean>('monitorLog'));
    // this.config2Service.set('config2', '成功了');
    // console.log(this.config2Service.getInternalConfig());
    // console.log(this.configService.get<number>('fsd'));
    // this.configService.set('HH', 'ahdhfdf')
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
    // console.log(this.configService.getSecurityConfig('dbUrl'))
    // console.log(typeof process.env['NO_COLOR'])
    // console.log(process.env['NO_COLOR'])
    // console.log(isColorAllowed() ? 'true' : 'false')
    // console.log(process.env['NODE_ENV'])
    resp.code = CodeEnum.SUCCESS;
    resp.rows = xmlJsonData.xml.age;
    return resp;
  }

  // @Get('/api/test/get')
  // @ApiOperation({
  //   summary: '测试 GET 泛型接口',
  //   description: '测试泛型接口',
  // })
  // @ApiCustomResponse({
  //   type: RespTestSchemaDto,
  // })
  // testingGet(@Query() params: ReqTestSchemaDto) {
  //   console.log(params);
  //   const resp = new RespTestSchemaDto();
  //   resp.code = CodeEnum.SUCCESS;
  //   resp.rows = 23;
  //   resp.schema = params.testObject;
  //   return resp;
  // }

  @Get('/gateway/test/get')
  @ApiOperation({
    summary: '测试 GET gateway接口',
    description: '测试gateway接口',
  })
  @ApiGenericsResponse(RespObjectDto, UserSessionDto)
  gatewayGet(@Query() params: ReqTestSchemaDto) {
    console.log(params);
    const resp = new RespObjectDto();
    resp.code = CodeEnum.SUCCESS;
    resp.rows = 23;
    return resp;
  }
}
