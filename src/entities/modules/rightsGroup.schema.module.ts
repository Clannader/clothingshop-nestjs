/**
 * Create by oliver.wu 2024/9/19
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RightsGroup, RightsGroupSchema } from '../schema';
import { RightsGroupSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightsGroup.name, schema: RightsGroupSchema },
    ]),
  ],
  providers: [RightsGroupSchemaService],
  exports: [RightsGroupSchemaService],
})
export class RightsGroupSchemaModule {}
