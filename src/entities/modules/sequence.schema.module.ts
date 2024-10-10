/**
 * Create by oliver.wu 2024/10/10
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sequence, SequenceSchema } from '../schema';
import { SequenceSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sequence.name, schema: SequenceSchema },
    ]),
  ],
  providers: [SequenceSchemaService],
  exports: [SequenceSchemaService],
})
export class SequenceSchemaModule {}
