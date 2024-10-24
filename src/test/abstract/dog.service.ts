/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';
import { Animal } from './animal.abstract';

@Injectable()
export class DogService extends Animal {
  getName(): string {
    return '狗';
  }
}
