/**
 * Create by oliver.wu 2025/12/26
 */
import { Module } from '@nestjs/common';
import { RightsGroupService } from './services';
import { RightsGroupController } from './controllers';
import {
  RightsGroupSchemaModule,
  DeleteLogSchemaModule,
} from '@/entities/modules';
import { UserLogsModule } from '@/logs';

@Module({
  imports: [RightsGroupSchemaModule, UserLogsModule, DeleteLogSchemaModule],
  controllers: [RightsGroupController],
  providers: [RightsGroupService],
})
export class RightsGroupModule {}
