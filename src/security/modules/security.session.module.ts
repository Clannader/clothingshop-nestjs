/**
 * Create by oliver.wu 2024/11/8
 */
import { Module } from '@nestjs/common';
import { SecuritySessionService } from '../services';
import { SecuritySessionCacheModule } from '@/cache/modules';

@Module({
  imports: [SecuritySessionCacheModule],
  providers: [SecuritySessionService],
  exports: [SecuritySessionService],
})
export class SecuritySessionModule {}
