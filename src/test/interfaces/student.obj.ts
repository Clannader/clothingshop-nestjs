/**
 * Create by oliver.wu 2024/10/30
 */
import { PersonImpl } from './person.interface'
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentObj implements PersonImpl {
  getName(): string {
    return '我是学生';
  }
}