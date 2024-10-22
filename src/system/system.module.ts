import { Module } from '@nestjs/common';
import { SystemService, RepairDataService, TimeZoneService } from './services';
import {
  SystemController,
  RepairDataController,
  TimeZoneController,
} from './controllers';

import { DatabaseModule } from '@/database';
import { UserLogsModule } from '@/logs';
import {
  RightCodeSchemaModule,
  SequenceSchemaModule,
  SystemDataSchemaModule,
  DeleteLogSchemaModule,
} from '@/entities/modules';

@Module({
  imports: [
    DatabaseModule,
    RightCodeSchemaModule,
    SequenceSchemaModule,
    SystemDataSchemaModule,
    DeleteLogSchemaModule,
    UserLogsModule,
  ],
  controllers: [SystemController, RepairDataController, TimeZoneController],
  providers: [SystemService, RepairDataService, TimeZoneService],
  exports: [SystemService],
})
export class SystemModule {}
