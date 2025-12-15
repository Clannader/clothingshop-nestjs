/**
 * Create by oliver.wu 2025/12/4
 */
import { Module } from '@nestjs/common';
import { RightsCodesService } from './services';
import { RightsCodesController } from './controllers';
import { RightsCodesSchemaModule } from '@/entities/modules';
import { UserLogsModule } from '@/logs';

@Module({
  imports: [RightsCodesSchemaModule, UserLogsModule],
  controllers: [RightsCodesController],
  providers: [RightsCodesService],
})
export class RightsCodesModule {}
