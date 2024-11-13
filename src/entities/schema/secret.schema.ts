/**
 * Create by oliver.wu 2024/11/12
 */
import { Prop } from '@nestjs/mongoose';

export class SecretSchema {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  secretId: string; // 关联秘钥的ID

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  secretText: string; // 加密后的密文
}
