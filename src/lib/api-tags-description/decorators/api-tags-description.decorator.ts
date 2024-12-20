/**
 * Create by oliver.wu 2024/12/19
 */
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { API_TAGS_DESC } from '../constants';

export type ApiTagsOptions = {
  name: string;
  description: string;
}

export const ApiTagsDescription = (controllerName: string, controllerDescription: string): ClassDecorator => {
  return applyDecorators(SetMetadata(API_TAGS_DESC, {
    name: controllerName,
    description: controllerDescription,
  } as ApiTagsOptions));
};
