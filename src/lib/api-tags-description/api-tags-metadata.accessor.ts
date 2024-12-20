/**
 * Create by oliver.wu 2024/12/19
 */
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_TAGS_DESC } from './constants';

@Injectable()
export class ApiTagsDescriptionMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getApiTagsDescriptionMetadata(target: Function): string {
    return this.getMetadata(API_TAGS_DESC, target);
  }

  private getMetadata<T>(key: string, target: Function): T | undefined {
    const isObject =
      typeof target === 'object'
        ? target !== null
        : typeof target === 'function';

    return isObject ? this.reflector.get(key, target) : undefined;
  }
}
