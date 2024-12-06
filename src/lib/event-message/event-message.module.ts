/**
 * Create by oliver.wu 2024/12/3
 */
import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

@Module({})
export class EventMessageModule {
  static forRoot(): DynamicModule {
    return {
      module: EventMessageModule,
      imports: [DiscoveryModule],
    };
  }
}
