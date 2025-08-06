import { Module } from '@nestjs/common';
import {
  SystemService,
  RepairDataService,
  TimeZoneService,
  SystemConfigService,
} from './services';
import {
  SystemController,
  RepairDataController,
  TimeZoneController,
  SystemConfigController,
} from './controllers';

import { DatabaseModule } from '@/database';
import { UserLogsModule } from '@/logs';
import {
  RightCodeSchemaModule,
  SequenceSchemaModule,
  SystemDataSchemaModule,
  DeleteLogSchemaModule,
  SystemConfigSchemaModule,
} from '@/entities/modules';
import { MemoryCacheModule } from '@/cache/modules';

@Module({
  imports: [
    DatabaseModule,
    RightCodeSchemaModule,
    SequenceSchemaModule,
    SystemDataSchemaModule,
    DeleteLogSchemaModule,
    UserLogsModule,
    SystemConfigSchemaModule,
    MemoryCacheModule,
  ],
  controllers: [
    SystemController,
    RepairDataController,
    TimeZoneController,
    SystemConfigController,
  ],
  providers: [
    SystemService,
    RepairDataService,
    TimeZoneService,
    SystemConfigService,
  ],
  exports: [SystemService],
})
export class SystemModule {}
