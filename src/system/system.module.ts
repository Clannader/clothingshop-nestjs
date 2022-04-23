import { Module } from '@nestjs/common';
import { SystemService } from './system.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
