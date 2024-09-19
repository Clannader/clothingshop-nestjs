/**
 * Create by oliver.wu 2024/9/19
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RightCodeModel, RightCode } from '../../schema';

@Injectable()
export class RightCodeSchemaService {
  @InjectModel(RightCode.name)
  private rightCodeModel: RightCodeModel;

  getModel() {
    return this.rightCodeModel;
  }
}
