import { Module } from '@nestjs/common';
import { SystemService, RepairDataService } from './services';
import { SystemController, RepairDataController } from './controllers';

import { DatabaseModule } from '@/database';
import { RightCodeSchemaModule } from '@/entities/modules';

@Module({
  imports: [DatabaseModule, RightCodeSchemaModule],
  controllers: [SystemController, RepairDataController],
  providers: [SystemService, RepairDataService],
  exports: [SystemService],
})
export class SystemModule {}
