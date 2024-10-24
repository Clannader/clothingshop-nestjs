/**
 * Create by oliver.wu 2024/10/24
 */
import { Module } from '@nestjs/common';

import { SequenceSchemaModule } from '@/entities/modules';
import { CatService } from './cat.service';
import { DogService } from './dog.service';
import { AnimalFactory } from './animal.factory';

@Module({
  imports: [SequenceSchemaModule],
  providers: [CatService, DogService, AnimalFactory],
  exports: [AnimalFactory],
})
export class AnimalFactoryModule {}
