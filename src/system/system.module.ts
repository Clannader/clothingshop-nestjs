import { Module } from '@nestjs/common';
import { SystemService, RepairDataService } from './services';
import { SystemController, RepairDataController } from './controllers';

@Module({
  imports: [],
  controllers: [SystemController, RepairDataController],
  providers: [SystemService, RepairDataService],
  exports: [SystemService],
})
export class SystemModule {}
