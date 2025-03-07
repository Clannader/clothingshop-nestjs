import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('/')
@ApiExcludeController(true) // 排除这controller不在swagger显示
export class AppController {
  // @Get(['/index$', '/index/*']) // 旧版本的需要加上$,否则/indexTest这样的路径也能进去首页
  // 新版本的已经不会进去了,所以需要去掉$符号
  @Get(['/index', '/index/*path'])
  @Render('index')
  gotoIndex() {
    return {};
  }
}
