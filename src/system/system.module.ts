import { Module } from '@nestjs/common';
import { SystemService, RepairDataService } from './services';
import { SystemController, RepairDataController } from './controllers';

import { DatabaseModule } from '@/database';

@Module({
  imports: [DatabaseModule],
  controllers: [SystemController, RepairDataController],
  providers: [SystemService, RepairDataService],
  exports: [SystemService],
})
export class SystemModule {}
