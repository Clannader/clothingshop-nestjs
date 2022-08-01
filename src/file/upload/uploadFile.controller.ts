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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor';
import { ApiCommon, ApiCustomResponse, CommonResult } from '@/common';
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
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log(params)
    console.log(file)
    const resp = new CommonResult();
    return resp;
  }
}
