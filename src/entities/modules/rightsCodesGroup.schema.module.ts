/**
 * Create by oliver.wu 2024/9/19
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RightCodeGroup, RightCodeGroupSchema } from '../schema';
import { RightsGroupSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightCodeGroup.name, schema: RightCodeGroupSchema },
    ]),
  ],
  providers: [RightsGroupSchemaService],
  exports: [RightsGroupSchemaService],
})
export class RightsCodesGroupSchemaModule {}
