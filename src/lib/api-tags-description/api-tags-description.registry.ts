/**
 * Create by oliver.wu 2024/12/19
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiTagsDescriptionRegistry {
  private readonly apiTagsMap = new Map<string, string>();

  addApiTagsDescription(key: string, description: string): void {
    const ref = this.apiTagsMap.get(key);
    if (!ref) {
      this.apiTagsMap.set(key, description);
    }
  }

  getApiTagsMap() {
    return this.apiTagsMap;
  }

  clearApiTagsMap() {
    [...this.apiTagsMap.keys()].forEach((key) => {
      this.apiTagsMap.delete(key);
    });
  }
}
