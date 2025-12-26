/**
 * Create by oliver.wu 2024/9/19
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RightsCode, RightsCodeSchema } from '../schema';
import { RightsCodeSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightsCode.name, schema: RightsCodeSchema },
    ]),
  ],
  providers: [RightsCodeSchemaService],
  exports: [RightsCodeSchemaService],
})
export class RightsCodeSchemaModule {}
