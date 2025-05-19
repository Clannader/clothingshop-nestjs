/**
 * Create by oliver.wu 2024/12/19
 */
import { INestApplication } from '@nestjs/common';
import { NestContainer } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Controller } from '@nestjs/common/interfaces';
import { API_TAGS_DESC } from './constants';
import { type ApiTagsOptions } from './decorators';

export class ApiTagsDescriptionRegistry {
  public static scanControllerTags(app: INestApplication): Map<string, string> {
    const apiTagsMap = new Map<string, string>();
    const container = (app as any).container as NestContainer;
    const modules: Module[] = [...container.getModules().values()];
    modules.forEach(({ controllers }) => {
      [...controllers.values()].forEach((wrapper: InstanceWrapper<Controller>) => {
        const { /*instance, */ metatype } = wrapper;
        // const prototype = Object.getPrototypeOf(instance);
        const tagsOptions: ApiTagsOptions = Reflect.getMetadata(
          API_TAGS_DESC,
          metatype,
        );
        if (tagsOptions) {
          apiTagsMap.set(tagsOptions.name, tagsOptions.description);
        }
      });
    });
    return apiTagsMap;
  }
}
