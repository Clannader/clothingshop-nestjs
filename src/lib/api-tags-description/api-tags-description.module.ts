/**
 * Create by oliver.wu 2024/12/19
 */
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ApiTagsDescriptionMetadataAccessor } from './api-tags-metadata.accessor';
import { ApiTagsDescriptionLoader } from './api-tags-description.loader';
import { ApiTagsDescriptionRegistry } from './api-tags-description.registry';

@Module({
  imports: [DiscoveryModule],
  providers: [
    ApiTagsDescriptionLoader,
    ApiTagsDescriptionRegistry,
    ApiTagsDescriptionMetadataAccessor,
  ],
  exports: [ApiTagsDescriptionRegistry],
})
export class ApiTagsDescriptionModule {}
