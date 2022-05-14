import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  Query,
  Inject,
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

@ApiCommon()
@Controller('/cms/api/test')
@ApiTags('TestController')
export class TestController {
  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly configService: ConfigService;

  @Post('/post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试 POST 泛型接口',
    description: '测试泛型接口',
  })
  @ApiCustomResponse({
    type: RespTestSchemaDto,
  })
  testingPost(@Body() params: ReqTestSchemaDto) {
    const resp = new RespTestSchemaDto();
    const dbUser: string = this.configService.get<string>('dbUser');
    console.log(dbUser);
    const httpPort: number = this.configService.get<number>('httpPort');
    console.log(httpPort);
    const printUrl: boolean = this.configService.get<boolean>(
      'printUrl3',
      false,
    );
    console.log(printUrl);
    console.log(this.configService.getInternalConfig());
    // this.configService.set<boolean>('boolean', false)
    // this.configService.set<number>('number', 120)
    // this.configService.set<string>('string', '4578')
    // this.configService.set('boolean2', false)
    // this.configService.set('number2', 120)
    // this.configService.set('string2', 'trtgfsgf')
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
