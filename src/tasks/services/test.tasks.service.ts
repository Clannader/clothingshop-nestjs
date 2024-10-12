/**
 * Create by oliver.wu 2024/10/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { SequenceTypeEnum } from '@/common/enum';
import { SequenceSchemaService } from '@/entities/services';

@Injectable()
export class TestTasksService {
  @Inject()
  private readonly sequenceSchemaService: SequenceSchemaService;

  @Interval(3000)
  async handleInterval() {
    // const [err, result] = await this.sequenceSchemaService
    //   .getNextSequence(SequenceTypeEnum.Message)
    //   .then((result) => [null, result])
    //   .catch((err) => [err]);
    // if (err) {
    //   console.error(err);
    //   return;
    // }
    // console.log(`序列号为:${result.sequenceId}`);
  }
}
