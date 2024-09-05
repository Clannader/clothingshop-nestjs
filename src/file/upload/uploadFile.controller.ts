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
import { HttpInterceptor } from '@/interceptor/http';
import { CommonResult, RequestSession } from '@/common';
import { ApiCommon, ApiCustomResponse } from '@/common/decorator';
import { Utils } from '@/common/utils';
import {
  ReqFileUploadTestDto,
  ReqFileUploadAlreadyDto,
  ReqFileUploadMergeDto,
  RespFileUploadAlreadyDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@ApiCommon()
@ApiTags('UploadFileController')
@Controller('/cms/api/file/upload')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
export class UploadFileController {
  private readonly uploadPath = 'tempUpload';

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
    @Req() request: RequestSession,
  ) {
    // 这里是通过multer这个组件来上传文件的,并且使用了内置的拦截器FileInterceptor
    // 效果不是很好,所以以后要是使用这个组件上传文件的话,还需要重新定义拦截器,修改报错信息返回等等
    // 不过可以暂时这样上传文件也是没有什么问题的
    // console.log(file);
    // 其实是可以拿到值的,只是自己忘记写@Expose()这个修饰器了,并且Buffer类型也是可以拿得到数据的
    // console.log(params); // 目前发现通过这个修饰器无法获取body的值,因为body不是一个标准的json,是这样的结构[Object: null prototype]{}
    // console.log(query); // 可以获取地址栏带的参数值
    // console.log(JSON.parse(JSON.stringify(request.body))) // 这样可以取到formData里面设置的值
    // console.log(request.file) // 这里打印的结果和@UploadedFile() file是一样的
    // const resp = new CommonResult();
    // resp.msg = file.buffer.toString() // 这个file.buffer这个取法是得使用内存的Storage才有效,因为我这里设置的是disk的Storage
    // 所以是没有buffer这个节点的

    /**
     * 大文件上传分片逻辑
     * 1.根据b站的视频总结,由前端读取文件的buffer流传入服务器中,服务器通过使用spark-md5来对buffer生成对于的md5码
     * 然后判断上传的文件中是否包含这个文件,进而判断不给用户多次上传同一文件的内容,文件名为[md5].[suffix]
     * 这种上传有个弊端,无法判断上传的文件真实的后缀名,因为这个后缀名是前端传过来的,如果是其他后缀的,前端非得传和原文件不一样的后缀时
     * 其实最坏的结果就是该文件在服务器中无法打开而已,并没有什么影响,因为服务器后续需要判断上传文件的大小,以及文件类型等内容
     * 2.如果使用multer这个组件是可以获取到文件的真实后缀名的,但是这样似乎不是很好判断,可以使用内存storage,来获取文件的buffer
     * 然后生成md5码,再进行读写文件到上传文件夹中
     * 3.另外还有一种情况就是前端来对buffer来进行md5码的生成,然后分片上传到服务器中,然后服务器再进行合并文件
     *
     * 如果使用第三种情况来上传文件的话,可以对buffer进行判断限流
     */
    return new CommonResult();
  }

  @Post('single')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试分片上传文件',
    description: '分片上传文件接口',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  uploadFileSingle(@Body() params: ReqFileUploadTestDto) {
    const fileName = params.fileName;
    const fileContent = params.fileContent;
    const resp = new CommonResult();
    resp.code = 1001;
    if (Utils.isEmpty(fileName)) {
      resp.msg = '文件名不能为空';
      return resp;
    }
    if (!/^[a-f0-9]{32}_[\d]+/.test(fileName)) {
      resp.msg = '文件名格式不正确';
      return resp;
    }
    if (Utils.isEmpty(fileContent)) {
      resp.msg = '文件内容不能为空';
      return resp;
    }
    // 这里我发现json其实还是可以传buffer过来的,只是当时前端代码写的有点问题
    const fileBuffer = Buffer.from(fileContent, 'base64');
    if (!Buffer.isBuffer(fileBuffer)) {
      resp.msg = '文件内容格式不正确';
      return resp;
    }
    if (fileBuffer.length > 10 * 1024 * 1024) {
      resp.msg = '文件大小超过10M';
      return resp;
    }
    const [, hashCode, chunkIndex] = /^([a-f0-9]{32})_([\d]+)/.exec(fileName);
    const fileDirPath = join(process.cwd(), this.uploadPath, hashCode);
    // 判断上传的临时文件是否存在这个hashCode,不存在就创建一个文件夹
    if (!fs.existsSync(fileDirPath)) {
      fs.mkdirSync(fileDirPath);
    }
    const filePath = join(fileDirPath, `${hashCode}_${chunkIndex}.temp`);
    // 判断临时文件是否传过,传过就返回文件已存在
    if (fs.existsSync(filePath)) {
      resp.code = 1000;
      resp.msg = '文件分片已存在';
      return resp;
    }
    // 没有传过就写入文件
    fs.writeFileSync(filePath, fileBuffer);
    resp.code = 1000;
    return resp;
  }

  @Post('already')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取已经上传过的分片集合',
    description: '返回服务器分片集合',
  })
  @ApiCustomResponse({
    type: RespFileUploadAlreadyDto,
  })
  uploadFileAlready(@Body() params: ReqFileUploadAlreadyDto) {
    const fileHash = params.fileHash;
    const resp = new RespFileUploadAlreadyDto();
    resp.code = 1001;
    if (Utils.isEmpty(fileHash)) {
      resp.msg = '文件的hash值不能为空';
      return resp;
    }
    if (!/^[a-f0-9]{32}/.test(fileHash)) {
      resp.msg = 'HASH值格式不正确';
      return resp;
    }
    resp.code = 1000;
    resp.fileChunk = [];
    const fileDirPath = join(process.cwd(), this.uploadPath, fileHash);
    if (!fs.existsSync(fileDirPath)) {
      // 如果不存在这个文件,返回空值
      return resp;
    }
    // 如果存在就遍历里面的值
    const fileDir = fs.readdirSync(fileDirPath, 'utf-8');
    const chunkArr: number[] = [];
    for (let i = 0; i < fileDir.length; i++) {
      const fileName = fileDir[i];
      const execFileName = /^([a-f0-9]{32})_([\d]+).temp/.exec(fileName);
      if (execFileName) {
        const [, , index] = execFileName;
        chunkArr.push(+index);
      }
    }
    resp.fileChunk = chunkArr;
    return resp;
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '合并已经上传过的分片集合',
    description: '生成完整的文件的接口',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  uploadFileMerge(@Body() params: ReqFileUploadMergeDto) {
    const fileHash = params.fileHash;
    const fileChunk = params.fileChunk;
    const fileName = params.fileName;
    const resp = new CommonResult();
    resp.code = 1001;
    if (Utils.isEmpty(fileHash)) {
      resp.msg = '文件的hash值不能为空';
      return resp;
    }
    if (!/^[a-f0-9]{32}/.test(fileHash)) {
      resp.msg = 'HASH值格式不正确';
      return resp;
    }
    if (+fileChunk <= 0) {
      resp.msg = '分片总数不能小于0';
      return resp;
    }
    if (Utils.isEmpty(fileName)) {
      resp.msg = '文件名不能为空';
      return resp;
    }
    const uploadPath = join(process.cwd(), this.uploadPath);
    const fileDirPath = join(uploadPath, fileHash);
    if (!fs.existsSync(fileDirPath)) {
      resp.msg = '文件不存在';
      return resp;
    }
    // 如果存在就遍历里面的值
    const fileDir = fs.readdirSync(fileDirPath, 'utf-8');
    const chunkSet: Set<number> = new Set<number>();
    const mergeFileDir = [];
    for (let i = 0; i < fileDir.length; i++) {
      const fileName = fileDir[i];
      const execFileName = /^([a-f0-9]{32})_([\d]+).temp/.exec(fileName);
      if (execFileName) {
        // 里面的文件名规则正确才会去合并文件,否则不合并
        const [, , index] = execFileName;
        // 避免有重复的index
        if (!chunkSet.has(+index)) {
          chunkSet.add(+index);
          mergeFileDir.push(fileName);
        }
      }
    }
    const chunkArr = Array.from(chunkSet);
    if (chunkArr.length !== fileChunk) {
      resp.msg = '文件分片不正确';
      return resp;
    }
    const fileNamePath = join(uploadPath, fileName);
    // 删除原本那个文件,否则下面的appendFileSync会继续传入文件的
    if (fs.existsSync(fileNamePath)) {
      fs.unlinkSync(fileNamePath);
    }
    mergeFileDir
      .sort((a, b) => {
        const reg = /_(\d+)/;
        // 上面的正则保证这里的正则肯定是能匹配的
        return +reg.exec(a)[1] - +reg.exec(b)[1];
      })
      .forEach((v) => {
        fs.appendFileSync(fileNamePath, fs.readFileSync(join(fileDirPath, v)));
      });
    // 然后删除临时文件
    for (let i = 0; i < fileDir.length; i++) {
      fs.unlinkSync(join(fileDirPath, fileDir[i]));
    }
    fs.rmdirSync(fileDirPath);
    resp.code = 1000;
    return resp;
  }
}
