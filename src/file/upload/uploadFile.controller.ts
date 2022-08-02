/**
 * Create by CC on 2022/8/1
 */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFile,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor';
import { ApiCommon, ApiCustomResponse, CommonResult, RequestSession } from '@/common';
import { ReqFileUploadTestDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@ApiCommon()
@ApiTags('UploadFileController')
@Controller('/cms/api/file/upload')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
export class UploadFileController {
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试上传文件',
    description: '上传文件接口',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFileTest(
    @Body() params: ReqFileUploadTestDto,
    @UploadedFile() file: Express.Multer.File,
    @Query() query: any,
    @Req() request: RequestSession
  ) {
    console.log(file);
    console.log(params); // 目前发现通过这个修饰器无法获取body的值,因为body不是一个标准的json,是这样的结构[Object: null prototype]{}
    console.log(query); // 可以获取地址栏带的参数值
    console.log(JSON.parse(JSON.stringify(request.body))) // 这样可以取到formData里面设置的值
    // console.log(request.file) // 这里打印的结果和@UploadedFile() file是一样的
    const resp = new CommonResult();
    // resp.msg = file.buffer.toString() // 这个file.buffer这个取法是得使用内存的Storage才有效,因为我这里设置的是disk的Storage
    // 所以是没有buffer这个节点的
    return resp;
  }
}
