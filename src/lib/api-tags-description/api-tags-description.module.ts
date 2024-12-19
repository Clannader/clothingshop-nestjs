/**
 * Create by oliver.wu 2024/12/19
 */
import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ApiTagsDescriptionMetadataAccessor } from './api-tags-metadata.accessor';
import { ApiTagsDescriptionExplorer } from './api-tags-description.explorer';
import { ApiTagsDescriptionRegistry } from './api-tags-description.registry';
import { ApiTagsDescriptionOrchestrator } from './api-tags-description.orchestrator';

@Module({
  imports: [DiscoveryModule],
  providers: [
    ApiTagsDescriptionMetadataAccessor,
    ApiTagsDescriptionOrchestrator,
  ],
})
export class ApiTagsDescriptionModule {
  static forRoot(): DynamicModule {
    return {
      module: ApiTagsDescriptionModule,
      providers: [ApiTagsDescriptionExplorer, ApiTagsDescriptionRegistry],
      exports: [ApiTagsDescriptionRegistry],
    };
  }
}
