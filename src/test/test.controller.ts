import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommon, ApiCustomResponse, CodeEnum } from '../common';
import { ReqTestSchemaDto, RespTestSchemaDto } from './dto';

@ApiCommon()
@Controller('/cms/api/test')
@ApiTags('TestController')
export class TestController {

  @Post('/post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试泛型接口',
    description: '测试泛型接口',
  })
  @ApiCustomResponse({
    type: RespTestSchemaDto,
  })
  testing(@Body() params: ReqTestSchemaDto) {
    console.log(params)
    const resp = new RespTestSchemaDto();
    resp.code = CodeEnum.SUCCESS
    resp.rows = 23
    return resp;
  }

}
