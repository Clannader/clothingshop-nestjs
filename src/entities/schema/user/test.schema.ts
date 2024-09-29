/**
 * Create by CC on 2022/6/2
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

@Schema()
export class Test extends Document {
  @Prop({ required: true })
  adminId: string; // 用户的唯一ID

  @Prop({
    required: true,
  })
  shopId: string; // 操作的店铺ID

  @Prop({
    required: true,
  })
  url: string; // 请求地址

}

export const TestSchema = SchemaFactory.createForClass(Test);

TestSchema.statics.getAliasName = function () {
  return 'TestSchema';
};

export interface TestModel extends Model<Test> {
  getAliasName(): string;
}
