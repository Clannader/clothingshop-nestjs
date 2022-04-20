import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ApiModule } from './api.module';
import { CmsModule } from './cms.module';

@Module({
  imports: [ApiModule, CmsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
