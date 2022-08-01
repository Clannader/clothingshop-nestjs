/**
 * Create by CC on 2022/8/1
 */
import { Module } from '@nestjs/common';
import { UploadFileController } from './uploadFile.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [UploadFileController],
})
export class UploadFileModule {}
