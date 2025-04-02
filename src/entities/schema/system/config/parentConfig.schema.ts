/**
 * Create by oliver.wu 2024/10/14
 */
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument, Types, Document } from 'mongoose';

import { CommonConfig } from './systemConfig.schema';

@Schema()
export class ParentConfig extends CommonConfig {}

export const ParentConfigSchema = SchemaFactory.createForClass(ParentConfig);

export type ParentConfigDocument = HydratedDocument<ParentConfig>;

export type ParentConfigQuery = (Document<unknown, {}, ParentConfig> &
  ParentConfig & { _id: Types.ObjectId } & { __v: number })[];

ParentConfigSchema.statics.getAliasName = function () {
  return 'ParentConfig';
};

export interface ParentConfigModel extends Model<ParentConfig> {
  getAliasName(): string;
}
