/**
 * Create by CC on 2022/8/1
 */
import { Module } from '@nestjs/common';
import { UploadFileController } from './uploadFile.controller';

@Module({
  controllers: [UploadFileController],
})
export class UploadFileModule {}
