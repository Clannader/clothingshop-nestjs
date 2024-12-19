/**
 * Create by oliver.wu 2024/12/19
 */
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { API_TAGS_DESC } from '../constants';

export const ApiTagsDescription = (description: string): MethodDecorator => {
  return applyDecorators(SetMetadata(API_TAGS_DESC, description));
};
