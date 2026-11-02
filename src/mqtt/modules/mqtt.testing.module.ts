/**
 * Create by oliver.wu 2026/10/29
 */
import { Module } from '@nestjs/common';
import { MqttTestingService, MqttSingleService } from '../services';
import { MqttTestingController } from '../controllers';
import { SystemConfigSchemaModule } from '@/entities/modules';
import { MemoryCacheModule } from '@/cache/modules';

@Module({
  imports: [SystemConfigSchemaModule, MemoryCacheModule],
  controllers: [MqttTestingController],
  providers: [MqttTestingService, MqttSingleService],
})
export class MqttTestingModule {}
