/**
 * Create by oliver.wu 2024/9/19
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RightCode, RightCodeSchema } from '../schema';
import { RightCodeSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightCode.name, schema: RightCodeSchema },
    ]),
  ],
  providers: [RightCodeSchemaService],
  exports: [RightCodeSchemaService],
})
export class RightCodeSchemaModule {}
