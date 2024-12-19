/**
 * Create by oliver.wu 2024/12/19
 */
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_TAGS_DESC, API_TAGS } from './constants';

@Injectable()
export class ApiTagsDescriptionMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getSwaggerApiTagsName(target: Function): string {
    return this.getMetadata(API_TAGS, target);
  }

  getApiTagsDescriptionMetadata(target: Function): string {
    return this.getMetadata(API_TAGS_DESC, target);
  }

  private getMetadata<T>(key: string, target: Function): T | undefined {
    if (
      !target ||
      (typeof target !== 'function' && typeof target !== 'object')
    ) {
      return undefined;
    }

    const metadata = this.reflector.get(key, target);
    if (!metadata) {
      return undefined;
    }
    return metadata;
  }
}
