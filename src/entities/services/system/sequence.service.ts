/**
 * Create by oliver.wu 2024/10/10
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SequenceModel, Sequence } from '../../schema';

@Injectable()
export class SequenceSchemaService {
  @InjectModel(Sequence.name)
  private sequenceModel: SequenceModel;

  getModel() {
    return this.sequenceModel;
  }
}
