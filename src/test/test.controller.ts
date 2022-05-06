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
import { ApiCommon, ApiCustomResponse, CodeEnum, GlobalService, i18n } from '../common';
import { ReqTestSchemaDto, RespTestSchemaDto } from './dto';

@ApiCommon()
@Controller('/cms/api/test')
@ApiTags('TestController')
export class TestController {
  @Inject()
  private readonly globalService: GlobalService

  constructor() {}

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
    console.log(params);
    console.log(i18n)
    console.log(GlobalService.GlobalStatic)
    console.log(this.globalService.lang())
    const resp = new RespTestSchemaDto();
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
