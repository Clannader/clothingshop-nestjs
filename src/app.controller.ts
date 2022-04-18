import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('/')
@ApiExcludeController(true) // 排除这controller不在swagger显示
export class AppController {
  @Get(['/index$', '/index/*'])
  @Render('index')
  gotoIndex() {
    return {};
  }
}
