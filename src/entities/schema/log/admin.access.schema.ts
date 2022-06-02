/**
 * Create by CC on 2022/6/2
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

@Schema()
export class AdminAccess extends Document {}

export const AdminAccessSchema = SchemaFactory.createForClass(AdminAccess);

export type AdminAccessModel = Model<AdminAccess>;
