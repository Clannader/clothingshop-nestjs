/**
 * Create by oliver.wu 2025/12/4
 */
import { Module } from '@nestjs/common';
import { RightsCodesService } from './services';
import { RightsCodesController } from './controllers';
import { RightsCodesSchemaModule } from '@/entities/modules';

@Module({
  imports: [RightsCodesSchemaModule],
  controllers: [RightsCodesController],
  providers: [RightsCodesService],
})
export class RightsCodesModule {}
