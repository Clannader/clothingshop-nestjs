import { Module, Global } from '@nestjs/common';
import { GlobalService } from './utils/global.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [GlobalService],
  exports: [GlobalService]
})
export class CommonModule {}
