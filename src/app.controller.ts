import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('example')
@Controller('example')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('getString')
  @ApiOperation({
    summary: '测试方法',
    description: '获取一个字符串',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
