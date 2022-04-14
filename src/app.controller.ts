import { Controller, Get, Render } from '@nestjs/common';

@Controller('/')
export class AppController {

  @Get(['/index$', '/index/*'])
  @Render('index')
  gotoIndex() {
    return {};
  }

}
