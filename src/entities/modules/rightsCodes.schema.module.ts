/**
 * Create by oliver.wu 2024/9/19
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RightCode, RightsCodeSchema } from '../schema';
import { RightsCodeSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightCode.name, schema: RightsCodeSchema },
    ]),
  ],
  providers: [RightsCodeSchemaService],
  exports: [RightsCodeSchemaService],
})
export class RightsCodesSchemaModule {}
