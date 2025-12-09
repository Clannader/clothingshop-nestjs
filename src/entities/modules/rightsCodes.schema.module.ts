/**
 * Create by oliver.wu 2024/9/19
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RightCode, RightCodeSchema } from '../schema';
import { RightsCodesSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightCode.name, schema: RightCodeSchema },
    ]),
  ],
  providers: [RightsCodesSchemaService],
  exports: [RightsCodesSchemaService],
})
export class RightsCodesSchemaModule {}
