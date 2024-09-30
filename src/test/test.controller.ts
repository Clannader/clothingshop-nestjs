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
import { ConfigService } from '@/common/config';
import { CodeEnum } from '@/common/enum';
import { GlobalService } from '@/common/utils';
import {
  ApiCommon,
  ApiCustomResponse,
  ApiGenericsResponse,
  XmlData,
  XmlJsonData,
} from '@/common/decorator';
import {
  ReqTestSchemaDto,
  RespTestSchemaDto,
  TestSchemaDto,
  RespObjectDto,
} from './dto';
// import { cloneClass } from './utils/test.utils';
import { UserSessionDto } from '@/user/dto';
import { XmlInterceptor } from '@/interceptor/xml';
import { MemoryCacheService } from '@/cache/services';
import { AdminSchemaService, TestSchemaService } from '@/entities/services';
import { AopLogger } from '@/logger';
// import { UserService } from '../user/user.service';
import { ReqDbStatisticsDto, RespDbStatisticsDto } from '@/database/dto';
import { ApiRights, RightsEnum } from '@/rights';
import { CommonResult } from '@/common';

@ApiCommon()
@Controller('/cms')
@ApiTags('TestController')
export class TestController {
  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  // @Inject()
  // private readonly userService: UserService;

  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly testSchemaService: TestSchemaService;

  // @Inject('TEST_CONFIG')
  // private readonly config2Service: ConfigService;

  @Inject()
  private readonly adminSchemaService: AdminSchemaService;

  private readonly logger = new AopLogger(TestController.name);

  @Post('/gateway/test/post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试 POST 泛型接口',
    description: '测试泛型接口',
  })
  @ApiGenericsResponse(RespTestSchemaDto, TestSchemaDto)
  @UseInterceptors(XmlInterceptor) // 拦截器返回XML格式的报文
  async testingPost(
    @Body() params: ReqTestSchemaDto,
    @XmlData() xmlData: string,
    @XmlJsonData() xmlJsonData: Record<string, any>,
    // @Headers('language') lang: string,
  ) {
    const resp = new RespTestSchemaDto();
    const result = new TestSchemaDto();
    result.age = 20;
    result.password = '123';
    result.username = '123';
    // console.log(params);
    // console.log(xmlData);
    // console.log(xmlJsonData);
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
    // throw new Error('fdsfdsfds')
    resp.code = CodeEnum.SUCCESS;
    resp.result = result;
    // resp.rows = xmlJsonData.xml.age;
    // return resp;

    const test = () => {
      return new Promise((resolve, reject) => {
        reject({});
      });
    };
    const testResult: Record<string, any> = await test()
      .then((res) => res)
      .catch((err) => err);
    // throw new CodeException(CodeEnum.TOKEN_EXPIRED, '哈哈')
    console.log(testResult.name.age);
    // const name = testResult?.name?.age
    // this.logger.error(name)
    // this.memoryCacheService.setMemoryCache('23444', { dfff: '' });
    // const keys = await this.memoryCacheService.getAllCacheKeys();
    // const value = await this.memoryCacheService.getMemoryCache('23444')
    // console.log(value)
    // console.log(keys)
    const findResult /*[err, findResult]*/ = await this.adminSchemaService
      .getModel()
      .countDocuments({ adminId: 'SUPERVISOR' }); // .then((result) => [null, result]).catch(err => [err])
    // console.log(err)
    // console.log('1111')
    // console.log(findResult)
    if (findResult) {
      // throw err
      // this.logger.error(err)
      // console.log(err)
    }
    console.log(findResult);
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
  async gatewayGet(@Query() params: ReqTestSchemaDto) {
    console.log(params);
    const resp = new RespObjectDto();
    resp.code = CodeEnum.SUCCESS;
    resp.rows = 23;
    await this.memoryCacheService.setMemoryCache('23444', { dfff: '' });
    console.log(this.memoryCacheService.getAllCacheKeys());
    return resp;
  }

  @Post('/api/test/database/discriminators')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试数据表鉴别器',
    description: '测试数据表鉴别器功能',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  testDatabaseDiscriminators() {
    const resp = new CommonResult();
    this.testSchemaService.testFindList();
    return resp;
  }
}
