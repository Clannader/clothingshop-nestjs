/**
 * Create by oliver.wu 2024/12/19
 */
import { INestApplication } from '@nestjs/common';

export class ApiTagsDescriptionRegistry {
  public static scanControllerTags(app: INestApplication): Map<string, string> {
    const apiTagsMap = new Map<string, string>();

    return apiTagsMap;
  }
}
