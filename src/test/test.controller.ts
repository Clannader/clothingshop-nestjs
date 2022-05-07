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
  GlobalService,
} from '../common';
import { ReqTestSchemaDto, RespTestSchemaDto } from './dto';

@ApiCommon()
@Controller('/cms/api/test')
@ApiTags('TestController')
export class TestController {
  @Inject()
  private readonly globalService: GlobalService;

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
    console.log(this.globalService.lang('ZH', '用户名', 'user.userName'));
    console.log(this.globalService.lang('EN', '用户名', 'user.user', '哈哈'));
    console.log(
      this.globalService.lang('ZH', '用户名3333{0}', 'user.user3', '哈哈'),
    );
    console.log(this.globalService.replaceArgs('adfd{0}fdsf', '哈哈'));
    console.log(this.globalService.replaceArgs('adfd{0}fdsf{1}', '哈哈'));
    console.log(
      this.globalService.replaceArgs('adfd{0}fdsf{1}', '哈哈', 'ASS'),
    );
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
