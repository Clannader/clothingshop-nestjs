/**
 * Create by CC on 2022/8/1
 */
import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import { diskStorage } from 'multer';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    const uploadDirName = 'tempUpload';
    const uploadDirPath = join(process.cwd(), uploadDirName);
    if (!fs.existsSync(uploadDirPath)) {
      fs.mkdirSync(uploadDirPath);
    }
    const storage = diskStorage({
      destination: uploadDirPath,
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    });
    return {
      preservePath: false,
      storage,
    };
  }
}
