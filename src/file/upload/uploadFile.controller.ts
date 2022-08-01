/**
 * Create by CC on 2022/8/1
 */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessionGuard } from '@/guard';
import { HttpInterceptor } from '@/interceptor';
import { ApiCommon, ApiCustomResponse, CommonResult } from '@/common';

@ApiCommon()
@ApiTags('UploadFileController')
@Controller('/cms/api/file/upload')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
export class UploadFileController {
  @Post('test')
  @ApiOperation({
    summary: '测试上传文件',
    description: '上传文件接口',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  uploadFileTest() {
    const resp = new CommonResult();
    return resp;
  }
}
