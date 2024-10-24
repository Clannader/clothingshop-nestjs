/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable, Inject } from '@nestjs/common';

import { CatService } from './cat.service';
import { DogService } from './dog.service';
import { Animal } from './animal.abstract';

@Injectable()
export class AnimalFactory {
  @Inject()
  private readonly catService: CatService;

  @Inject()
  private readonly dogService: DogService;

  getAnimalInstance(type: string = 'cat'): Animal {
    if (type === 'cat') {
      return this.catService;
    } else if (type === 'dog') {
      return this.dogService;
    }
  }
}
