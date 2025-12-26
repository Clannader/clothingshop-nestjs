/**
 * Create by oliver.wu 2025/12/26
 */
import { Module } from '@nestjs/common';
import { RightsGroupService } from './services';
import { RightsGroupController } from './controllers';
import { RightsCodesGroupSchemaModule } from '@/entities/modules';
import { UserLogsModule } from '@/logs';

@Module({
  imports: [RightsCodesGroupSchemaModule, UserLogsModule],
  controllers: [RightsGroupController],
  providers: [RightsGroupService],
})
export class RightsGroupModule {}
