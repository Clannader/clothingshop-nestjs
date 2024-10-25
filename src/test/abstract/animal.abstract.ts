/**
 * Create by oliver.wu 2024/10/24
 */
import { Inject, Injectable } from '@nestjs/common';

import { SequenceSchemaService } from '@/entities/services';
import { SequenceTypeEnum } from '@/common/enum';

@Injectable()
export abstract class Animal {
  @Inject()
  protected readonly sequenceSchemaService: SequenceSchemaService;

  abstract getName(): string;

  getFullName() {
    return '该动物叫做' + this.getName();
  }

  getSequenceAnimal() {
    return this.sequenceSchemaService.getNextSequence(
      SequenceTypeEnum.AnimalId,
    );
  }
}
