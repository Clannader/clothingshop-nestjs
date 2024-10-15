/**
 * Create by oliver.wu 2024/10/10
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SystemConfig,
  SystemConfigSchema,
  ParentConfig,
  ParentConfigSchema,
  ChildrenConfig,
  ChildrenConfigSchema,
} from '../schema';
import { SystemConfigSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SystemConfig.name,
        schema: SystemConfigSchema,
        discriminators: [
          {
            name: ParentConfig.name,
            schema: ParentConfigSchema,
          },
          {
            name: ChildrenConfig.name,
            schema: ChildrenConfigSchema,
          },
        ],
      },
    ]),
  ],
  providers: [SystemConfigSchemaService],
  exports: [SystemConfigSchemaService],
})
export class SystemConfigSchemaModule {}
