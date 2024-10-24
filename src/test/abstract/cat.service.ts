/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';
import { Animal } from './animal.abstract';

@Injectable()
export class CatService extends Animal {
  getName(): string {
    return '猫';
  }

  getFullName(): string {
    return '我重写了自己的名字';
  }
}
