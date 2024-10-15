/**
 * Create by oliver.wu 2024/10/14
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonConfig } from './systemConfig.schema';

@Schema()
export class ParentConfig extends CommonConfig {}

export const ParentConfigSchema = SchemaFactory.createForClass(ParentConfig);

ParentConfigSchema.statics.getAliasName = function () {
  return 'ParentConfig';
};

export interface ParentConfigModel extends Model<ParentConfig> {
  getAliasName(): string;
}
