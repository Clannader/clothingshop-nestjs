/**
 * Create by oliver.wu 2024/11/12
 */
import { Prop } from '@nestjs/mongoose';
import { WriteLog } from '@/common/decorator';

export class SecretSchema {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  @WriteLog({
    origin: '秘钥ID',
    key: 'system.parameterSecretId',
  })
  secretId: string; // 关联秘钥的ID

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  @WriteLog({
    origin: '密文',
    key: 'system.parameterSecretText',
    piiData: true,
  })
  secretText: string; // 加密后的密文
}
