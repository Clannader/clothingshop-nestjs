/**
 * Create by oliver.wu 2024/10/30
 */
import { Injectable } from '@nestjs/common';
import { PersonImpl } from './person.interface';

@Injectable()
export class PersonObj {
  getYourAreName(person: PersonImpl) {
    console.log(person.getName());
  }
}
