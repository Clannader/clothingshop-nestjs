import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './filter/httpExceptionFilter';
import { ValidationPipe } from './pipe/validationPipe';

import { UserModule } from './user/user.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    }
  ],
})
export class AppModule {}
