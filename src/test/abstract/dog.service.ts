/**
 * Create by oliver.wu 2024/10/24
 */
import { Inject, Injectable } from '@nestjs/common';
import { Animal } from './animal.abstract';
import { SequenceSchemaService } from '@/entities/services';
import { SequenceTypeEnum } from '@/common/enum';

@Injectable()
export class DogService extends Animal {
  getName(): string {
    return '狗';
  }

  async getSequenceAnimal() {
    await this.sequenceSchemaService.getNextSequence(
      SequenceTypeEnum.AnimalId,
    );
    await this.sequenceSchemaService.getNextSequence(
      SequenceTypeEnum.AnimalId,
    );
    return this.sequenceSchemaService.getNextSequence(
      SequenceTypeEnum.AnimalId,
    );
  }

}
