/**
 * Create by oliver.wu 2024/10/14
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SystemDataSchema,
  SystemData,
  TimeZoneData,
  TimeZoneDataSchema,
} from '../schema';
import { SystemDataSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SystemData.name,
        schema: SystemDataSchema,
        discriminators: [
          {
            name: TimeZoneData.name,
            schema: TimeZoneDataSchema,
          },
        ],
      },
    ]),
  ],
  providers: [SystemDataSchemaService],
  exports: [SystemDataSchemaService],
})
export class SystemDataSchemaModule {}
