import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@/common/config';
import { CodeEnum } from '@/common/enum';
import { GlobalService, Utils } from '@/common/utils';
import {
  ApiCommon,
  ApiCustomResponse,
  ApiGenericsResponse,
  UserLanguage,
  UserSession,
  XmlData,
  XmlJsonData,
} from '@/common/decorator';
import {
  ReqSerializerRoleEntityDto,
  ReqSerializerUserEntityDto,
  ReqTestSchemaDto,
  RespObjectDto,
  RespSerializerUserEntityDto,
  RespTestSchemaDto,
  TestSchemaDto,
  ReqSerializerParamsDto,
} from './dto';
// import { cloneClass } from './utils/test.utils';
import { UserSessionDto } from '@/user/dto';
import { XmlInterceptor } from '@/interceptor/xml';
import {
  MemoryCacheService,
  TokenCacheService,
  SecuritySessionCacheService,
} from '@/cache/services';
import {
  AdminSchemaService,
  SystemDataSchemaService,
} from '@/entities/services';
import { AopLogger } from '@/logger';
// import { UserService } from '../user/user.service';
import { CmsSession, CommonResult, LanguageType } from '@/common';
import { TestService } from './test.service';
import { AnimalFactory, Animal } from './abstract';
import { HttpFactoryService, ServiceType } from '@/http';
import { RespTimeZoneAllDto } from '@/system/dto';
import { HttpInterceptor } from '@/interceptor/http';
import { PersonObj, StudentObj, TeacherObj } from '@/test/interfaces';

@ApiCommon()
@Controller('/cms')
@ApiTags('TestController')
export class TestController {
  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  @Inject()
  private readonly securitySessionCacheService: SecuritySessionCacheService;

  // @Inject()
  // private readonly userService: UserService;

  @Inject()
  private readonly configService: ConfigService;

  // @Inject('TEST_CONFIG')
  // private readonly config2Service: ConfigService;

  @Inject()
  private readonly adminSchemaService: AdminSchemaService;

  @Inject()
  private readonly testService: TestService;

  @Inject()
  private readonly systemDataSchemaService: SystemDataSchemaService;

  @Inject()
  private readonly animalFactory: AnimalFactory;

  @Inject()
  private readonly httpFactoryService: HttpFactoryService;

  @Inject()
  protected readonly tokenCacheService: TokenCacheService;

  @Inject()
  private readonly personObj: PersonObj;

  @Inject()
  private readonly studentObj: StudentObj;

  @Inject()
  private readonly teacherObj: TeacherObj;

  private readonly logger = new AopLogger(TestController.name);

  @Post('/gateway/test/post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试 POST 泛型接口',
    description: '测试泛型接口',
  })
  @ApiGenericsResponse(RespTestSchemaDto, TestSchemaDto)
  // @UseInterceptors(XmlInterceptor) // 拦截器返回XML格式的报文
  @UseInterceptors(HttpInterceptor)
  async testingPost(
    @Body() params: ReqTestSchemaDto,
    @UserSession() session: CmsSession,
    // @XmlData() xmlData: string,
    // @XmlJsonData() xmlJsonData: Record<string, any>,
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
    // console.log(lang);
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
    // this.configService.set('HH', 'monitorLog')
    // console.log(this.configService.getInternalConfig())
    // this.configService.set<boolean>('boolean', false)
    // this.configService.set<number>('number', 120)
    // this.configService.set<string>('string', '4578')
    // this.configService.set('boolean2', false)
    // this.configService.set('number2', 120)
    // this.configService.set('string2', 'monitorLog')

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
    // throw new Error('monitorLog')
    resp.code = CodeEnum.SUCCESS;
    resp.result = result;
    // resp.rows = xmlJsonData.xml.age;
    // return resp;

    // const test = (): Record<string, any> => {
    //   return new Promise((resolve, reject) => {
    //     reject({});
    //   });
    // };
    // const testResult: Record<string, any> = await test()
    //   .then((res) => res)
    //   .catch((err) => err);
    // throw new CodeException(CodeEnum.TOKEN_EXPIRED, '哈哈')
    // console.log(testResult.name.age);
    // const name = testResult?.name?.age
    // this.logger.error(name)
    // await this.memoryCacheService.setMemoryCache(params.testField, {
    //   name: params.testField,
    // });
    // const keys = await this.memoryCacheService.getAllCacheKeys();
    // const value = await this.memoryCacheService.getMemoryCache(
    //   params.testField,
    // );
    // console.log(params.testField);
    // console.log(value);
    // console.log(keys);
    // console.log(await this.memoryCacheService.getMemoryCache('oliver'));
    // const findResult /*[err, findResult]*/ = await this.adminSchemaService
    //   .getModel()
    //   .countDocuments({ adminId: 'SUPERVISOR' }); // .then((result) => [null, result]).catch(err => [err])
    // console.log(err)
    // console.log('1111')
    // console.log(findResult)
    // if (findResult) {
    // throw err
    // this.logger.error(err)
    // console.log(err)
    // }
    // console.log(findResult);

    // let animal: Animal = this.animalFactory.getAnimalInstance(params.testField);
    // console.log(animal.getName());
    // console.log(animal.getFullName());
    // console.log(await animal.getSequenceAnimal());

    // this.httpFactoryService
    //   .getHttpService(params.testField)
    //   .post('/ifc/web/HotelList/getHotelList')
    //   .subscribe({
    //     next: (res) => {
    //       console.log(res);
    //     },
    //     error: (err) => {
    //       console.log(err);
    //     },
    //   });

    // console.log(this.httpFactoryService
    //   .getHttpService(session, params.testField) instanceof LocalhostHttpService)
    // const [err, list] = await Utils.toPromise(
    //   this.httpFactoryService
    //     .getHttpService(session, params.testField)
    //     .get<RespTimeZoneAllDto>('/cms/api/timeZone/allList'),
    // );
    // // console.error(err)
    // console.log(list.data.timeZones.length);

    // const getAllList = await this.httpFactoryService
    //   .getHttpService(session, <ServiceType>params.testField);
    // await Promise.all([
    //   getAllList.get('/cms/api/timeZone/allList'),
    //   getAllList.get('/cms/api/timeZone/allList'),
    //   getAllList.get('/cms/api/timeZone/allList'),
    //   getAllList.get('/cms/api/timeZone/allList'),
    //   getAllList.get('/cms/api/timeZone/allList'),
    //   getAllList.get('/cms/api/timeZone/allList'),
    //   getAllList.get('/cms/api/timeZone/allList'),
    //   getAllList.get('/cms/api/timeZone/allList'),
    // ]).then((result) => {
    //   result.forEach((value) => {
    //     console.log(value.data.timeZones.length);
    //   });
    // });

    // const [err, list] = await Utils.toPromise(
    //   this.httpFactoryService
    //     .getHttpService(session, params.testField)
    //     .post('/ifc/web/HotelList/getHotelList'),
    // );
    // if (err) {
    //   console.log(err.message)
    // } else {
    //   console.log(list.data);
    // }

    const service = await this.httpFactoryService.getHttpService(
      session,
      <ServiceType>params.testField,
    );
    let err, respResult;
    console.time('耗时');
    if (params.testField === 'localhost') {
      [err, respResult] = await Utils.toPromise(
        service.get<RespTimeZoneAllDto>('/cms/api/timeZone/allList'),
      );
      if (err) {
        console.error(err.message);
      } else {
        console.log(respResult.data.timeZones.length);
      }
    } else if (params.testField === 'staging') {
      [err, respResult] = await Utils.toPromise(
        service.post('/ifc/web/HotelList/getHotelList'),
      );
      if (err) {
        console.error(err.message);
      } else {
        console.log(respResult.data.total);
      }
      // 并发异步
      // await Promise.all([
      //   service.post('/ifc/web/HotelList/getHotelList'),
      //   service.post('/ifc/web/HotelList/getHotelList'),
      //   service.post('/ifc/web/HotelList/getHotelList'),
      //   service.post('/ifc/web/HotelList/getHotelList'),
      //   service.post('/ifc/web/HotelList/getHotelList'),
      //   service.post('/ifc/web/HotelList/getHotelList'),
      //   service.post('/ifc/web/HotelList/getHotelList'),
      //   service.post('/ifc/web/HotelList/getHotelList'),
      // ]);
      // 同步等待
      // await service.post('/ifc/web/HotelList/getHotelList');
      // await service.post('/ifc/web/HotelList/getHotelList');
      // await service.post('/ifc/web/HotelList/getHotelList');
      // await service.post('/ifc/web/HotelList/getHotelList');
      // await service.post('/ifc/web/HotelList/getHotelList');
      // await service.post('/ifc/web/HotelList/getHotelList');
      // await service.post('/ifc/web/HotelList/getHotelList');
      // await service.post('/ifc/web/HotelList/getHotelList');
    } else if (params.testField === 'jwt') {
      [err, respResult] = await Utils.toPromise(
        service.get('/gateway/api/system/config/search'),
      );
      if (err) {
        console.error(err.message);
      } else {
        console.log(respResult.data.config);
      }
    }
    console.timeEnd('耗时');
    console.log(
      await this.securitySessionCacheService.getSecuritySessionCache(
        params.sessionId,
      ),
    );
    // const encrypt = Utils.rsaPublicEncrypt('Hello RSA');
    // console.log(encrypt);
    // console.log(await this.memoryCacheService.rsaPrivateDecrypt(encrypt));
    //
    // const encrypt2 = Utils.rsaPrivateEncrypt('Hello RSA');
    // console.log(encrypt2);
    // console.log(Utils.rsaPublicDecrypt(encrypt2));
    // console.log(Utils.base64ToString(Utils.getRsaPublicKey()));
    //
    // const encrypt3 = Utils.rsaPrivateEncrypt('Hello RSA');
    // console.log(encrypt3);
    // console.log(Utils.rsaPublicDecrypt(encrypt3));
    // console.log(
    //   Utils.base64ToString(await this.memoryCacheService.getRsaPublicKey()),
    // );
    // this.personObj.getYourAreName(this.teacherObj);
    // this.personObj.getYourAreName(this.studentObj);
    // await this.tokenCacheService.setTokenCache('1111', params.testNumber + '');
    // console.log(await this.tokenCacheService.getAllCacheKeys());
    // console.log(service.axiosRef.interceptors);
    // const jwtService = await this.httpFactoryService.getJwtService(session)
    // jwtService.get('/gateway/api/system/config/search').then(result => {
    //   console.log(result.data)
    // })

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
    await this.memoryCacheService.setMemoryCache('23444', { diff: '' });
    console.log(this.memoryCacheService.getAllCacheKeys());
    return resp;
  }

  @ApiExcludeEndpoint() // 可以在swagger中隐藏接口,但是该接口是有效的
  @Post('/api/test/instance/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试Service是否是多实例还是单实例',
    description: '测试Service是否是多实例还是单实例',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  async testInstance(
    @UserSession() session: CmsSession,
    @Param('id') id: number,
    @UserLanguage() language: LanguageType,
  ) {
    // console.log(typeof id); // 这里要注意的是虽然ts断言类型是number,但是实际上拿到的类型还是string
    console.log(language);

    // const sleep = (id) => {
    //   return new Promise((resolve) => {
    //     setTimeout(resolve, id * 1000);
    //   });
    // };

    // console.log(
    //   id +
    //     '------' +
    //     this.globalService.serverLang(
    //       session,
    //       'Ids不能为空',
    //       'common.idsIsEmpty',
    //     ),
    // );
    // console.log(id + '------' + this.globalService.i);
    // console.log(id + '------' + this.testService.testI);
    // this.globalService.i++;
    // this.testService.testI++;
    // await sleep(+id);
    // console.log(
    //   id +
    //     '------' +
    //     this.globalService.serverLang(
    //       session,
    //       'Ids不能为空',
    //       'common.idsIsEmpty',
    //     ),
    // );
    // console.log(id + '------' + this.globalService.i);
    // console.log(id + '------' + this.testService.testI);
    // 假设传入5和3秒,多实例的时候结果应该是
    // 5(s) ---- 3(i) 初始值是3,第一次进来没i++,所以是3, i++后,第二次进来由于是单例,所以是新的对象还是3, 之后执行i++, 变成4, 所以后面都输出的是4
    // 3(s) ---- 3(i)
    // 3(s)---- 4(i)
    // 5(s) ---- 4(i)

    // 如果是单例时,输出
    // 5(s) ---- 3(i) 初始值是3,第一次进来没i++,所以是3, i++后,第二次进来值变了,变成4, 4之后执行i++, 变成5, 所以后面都输出的是5
    // 3(s) ---- 4(i)
    // 3(s) ---- 5(i)
    // 5(s) ---- 5(i)

    // 总结可以使用session传参,session是独立的,如果想省事,只能是Service变成多实例化了
    // 这里还有一个问题要思考,如果A是多实例的,那么B引入了A,B会是多实例还是单例???
    // 事实证明,B是多实例的

    // const [, result] = await Utils.toPromise(
    //   this.systemDataSchemaService.getTimeZoneDataModel().updateOne(
    //     // {_id: '67107f5a38c50a30d2d58e2b'},
    //     { timeZone: 'Europe/London2' },
    //     {
    //       $set: {
    //         timeZone: 'Europe/London2',
    //         summer: '+01:00', // 已知:$setOnInsert有的更新字段,$set不能有.如果数据库中有值,仅更新$set的字段,不会更新$setOnInsert
    //       },
    //       $setOnInsert: {
    //         winter: '+00:00' // 数据库中没有值,执行创建才会把这个字段set进去
    //       },
    //     },
    //     { upsert: true }, // 每一次更新都会插入相同的_id,根据更新条件插入的,如果数据库没有值则插入$setOnInsert的值,如果有值则仅更新$set
    //   ),
    // );
    // if (result) {
    //   console.log(result);
    // }
    return new CommonResult();
  }

  @Post('/api/test/serializer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试nestjs请求和响应序列化问题',
    description: '测试nestjs请求和响应序列化问题',
  })
  @ApiCustomResponse({
    type: RespSerializerUserEntityDto,
  })
  testSerializer(@Body() params: ReqSerializerParamsDto) {
    console.log(params);
    const resp = new RespSerializerUserEntityDto();
    const role = new ReqSerializerRoleEntityDto({
      id: 8888,
      name: 'admin',
    });
    resp.user = new ReqSerializerUserEntityDto({
      id: 123456,
      status: true,
      firstName: 'Kamil',
      lastName: 'Mystical',
      password: 'password',
      role: role,
    });
    return resp;
  }
}
