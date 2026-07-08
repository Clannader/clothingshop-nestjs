# NestJS 防止恶意登录导致账号被锁的完整防御方案

---

## 1. 核心防御策略总览

| 层级 | 防御措施 | 作用 | 实现方式 |
|------|----------|------|----------|
| 网络层 | IP 限流 + WAF | 拦截高频攻击 | ThrottlerModule / Nginx |
| 应用层 | 登录失败计数 | 账号级锁定 | Redis + Guard |
| 交互层 | CAPTCHA 验证码 | 区分人机 | reCAPTCHA / hCaptcha |
| 认证层 | 多因素认证 (MFA) | 增加破解成本 | TOTP / SMS / Email |
| 数据层 | 密码安全策略 | 防止弱口令 | Zxcvbn + 密码历史 |
| 监控层 | 日志审计 + 告警 | 实时发现攻击 | Winston + 钉钉/飞书 |

---

## 2. 账号登录失败锁定机制

### 2.1 核心原理

- 记录每个账号的连续失败次数
- 超过阈值后锁定账号（如 30 分钟）
- 支持手动解锁和管理员后台操作

### 2.2 Redis 存储设计

```
Key: login_fail:${username}
Value: JSON { count: number, firstFailAt: timestamp, lockedUntil: timestamp|null }
TTL: 30min (动态调整)

Key: login_lock:${username}
Value: 锁定原因及时间
TTL: 30min ~ 24h (根据失败次数递增)
```

### 2.3 AccountLockService 实现

```typescript
// src/auth/services/account-lock.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

interface LockRecord {
  failCount: number;
  firstFailAt: number;
  lockedUntil: number | null;
}

@Injectable()
export class AccountLockService {
  private readonly MAX_FAIL_ATTEMPTS = 5;
  private readonly BASE_LOCK_DURATION_MS = 30 * 60 * 1000; // 30 分钟

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async recordFailedAttempt(username: string): Promise<boolean> {
    const key = `login_fail:${username}`;
    const now = Date.now();

    const data = await this.redis.get(key);
    let record: LockRecord;

    if (data) {
      record = JSON.parse(data);
      // 如果已经过了窗口期（如 30 分钟），重置计数
      if (now - record.firstFailAt > this.BASE_LOCK_DURATION_MS) {
        record = { failCount: 0, firstFailAt: now, lockedUntil: null };
      }
    } else {
      record = { failCount: 0, firstFailAt: now, lockedUntil: null };
    }

    record.failCount += 1;

    // 超过阈值则锁定
    if (record.failCount >= this.MAX_FAIL_ATTEMPTS) {
      const lockDuration = this.calculateLockDuration(record.failCount);
      record.lockedUntil = now + lockDuration;
      await this.redis.set(
        `login_lock:${username}`,
        JSON.stringify({ reason: 'Too many failed attempts', lockedAt: now }),
        'PX',
        lockDuration,
      );
    }

    // 更新失败记录，TTL 设为窗口期
    await this.redis.set(key, JSON.stringify(record), 'PX', this.BASE_LOCK_DURATION_MS);

    return record.lockedUntil !== null;
  }

  async isAccountLocked(username: string): Promise<{ locked: boolean; remainingMs?: number }> {
    const lockData = await this.redis.get(`login_lock:${username}`);
    if (!lockData) return { locked: false };

    const lockInfo = JSON.parse(lockData);
    const remainingMs = lockInfo.lockedAt + this.BASE_LOCK_DURATION_MS * 2 - Date.now();

    if (remainingMs <= 0) {
      await this.clearLock(username);
      return { locked: false };
    }

    return { locked: true, remainingMs };
  }

  async clearFailedAttempts(username: string): Promise<void> {
    await this.redis.del(`login_fail:${username}`);
  }

  async clearLock(username: string): Promise<void> {
    await this.redis.del(`login_fail:${username}`);
    await this.redis.del(`login_lock:${username}`);
  }

  private calculateLockDuration(failCount: number): number {
    // 指数退避：5次30分钟，10次2小时，15次24小时
    if (failCount >= 15) return 24 * 60 * 60 * 1000;
    if (failCount >= 10) return 2 * 60 * 60 * 1000;
    return this.BASE_LOCK_DURATION_MS;
  }
}
```

### 2.4 登录 Guard 集成

```typescript
// src/auth/guards/account-lock.guard.ts
import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AccountLockService } from '../services/account-lock.service';

@Injectable()
export class AccountLockGuard implements CanActivate {
  constructor(private readonly accountLockService: AccountLockService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { username } = request.body;

    if (!username) return true; // 让后续验证处理

    const lockStatus = await this.accountLockService.isAccountLocked(username);

    if (lockStatus.locked) {
      const minutes = Math.ceil((lockStatus.remainingMs || 0) / 60000);
      throw new HttpException(
        {
          code: 'ACCOUNT_LOCKED',
          message: `Account is locked due to too many failed attempts. Please try again in ${minutes} minutes.`,
          remainingMinutes: minutes,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
```

### 2.5 AuthController 中应用

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountLockService } from './services/account-lock.service';
import { AccountLockGuard } from './guards/account-lock.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountLockService: AccountLockService,
  ) {}

  @Post('login')
  @UseGuards(AccountLockGuard)
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.authService.validateUser(dto.username, dto.password);

      if (!result) {
        await this.accountLockService.recordFailedAttempt(dto.username);
        return {
          success: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Username or password is incorrect',
        };
      }

      // 登录成功，清除失败记录
      await this.accountLockService.clearFailedAttempts(dto.username);
      const token = await this.authService.generateToken(result);

      return { success: true, token };
    } catch (error) {
      // 如果是 guard 抛出的锁定异常，直接透传
      throw error;
    }
  }
}
```

---

## 3. IP 级别限流防护

### 3.1 使用 @nestjs/throttler

```bash
npm install @nestjs/throttler
```

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,        // 1 分钟
        limit: 5,          // 每 IP 每分钟最多 5 次登录尝试
      },
      {
        name: 'long',
        ttl: 3600000,    // 1 小时
        limit: 20,       // 每 IP 每小时最多 20 次
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 3.2 针对登录接口单独限流

```typescript
// src/auth/auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 登录接口更严格：1 分钟 3 次
  @UseGuards(AccountLockGuard)
  async login(@Body() dto: LoginDto) {
    // ...
  }
}
```

### 3.3 自定义 Throttler 存储（Redis 共享）

```typescript
// src/throttler/throttler-storage.service.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerStorageRecord } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

// 使用 redis 共享限流计数，支持多实例部署
// npm install nestjs-throttler-storage-redis

// app.module.ts 中配置
ThrottlerModule.forRoot({
  throttlers: [
    { ttl: 60000, limit: 5 },
  ],
  storage: new ThrottlerStorageRedisService(redisClient),
});
```

---

## 4. CAPTCHA 人机验证

### 4.1 登录前校验验证码

```typescript
// src/auth/dto/login.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  captchaToken?: string; // reCAPTCHA v3 token
}
```

```typescript
// src/auth/services/captcha.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CaptchaService {
  private readonly RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

  constructor(private readonly httpService: HttpService) {}

  async verify(token: string, ip?: string): Promise<boolean> {
    if (!token) return false;

    const { data } = await firstValueFrom(
      this.httpService.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: this.RECAPTCHA_SECRET,
          response: token,
          remoteip: ip,
        },
      }),
    );

    // reCAPTCHA v3: score < 0.5 视为机器人
    if (!data.success || (data.score !== undefined && data.score < 0.5)) {
      return false;
    }

    return true;
  }
}
```

### 4.2 动态触发 CAPTCHA

```typescript
// src/auth/guards/captcha.guard.ts
import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CaptchaService } from '../services/captcha.service';
import { AccountLockService } from '../services/account-lock.service';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private readonly captchaService: CaptchaService,
    private readonly accountLockService: AccountLockService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { username, captchaToken } = request.body;
    const clientIp = request.ip;

    // 查询该账号近期失败次数
    const failKey = `login_fail:${username}`;
    const failData = await this.accountLockService['redis'].get(failKey);
    const failCount = failData ? JSON.parse(failData).failCount : 0;

    // 失败 >= 2 次后强制要求验证码
    if (failCount >= 2) {
      if (!captchaToken) {
        throw new HttpException(
          { code: 'CAPTCHA_REQUIRED', message: 'Please complete the CAPTCHA verification' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const valid = await this.captchaService.verify(captchaToken, clientIp);
      if (!valid) {
        throw new HttpException(
          { code: 'CAPTCHA_INVALID', message: 'CAPTCHA verification failed' },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return true;
  }
}
```

---

## 5. 多因素认证 (MFA)

### 5.1 TOTP 基于时间的一次性密码

```bash
npm install speakeasy qrcode
```

```typescript
// src/auth/services/mfa.service.ts
import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class MfaService {
  generateSecret(username: string) {
    const secret = speakeasy.generateSecret({
      name: `MyApp (${username})`,
      length: 32,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // 允许前后 2 个时间窗口（±1分钟）
    });
  }
}
```

### 5.2 登录流程中的 MFA 校验

```typescript
// src/auth/auth.controller.ts
@Post('login/mfa')
async loginWithMfa(@Body() dto: LoginMfaDto) {
  const user = await this.authService.validateUser(dto.username, dto.password);
  if (!user) {
    await this.accountLockService.recordFailedAttempt(dto.username);
    throw new UnauthorizedException('Invalid credentials');
  }

  // 如果用户开启了 MFA
  if (user.mfaEnabled) {
    if (!dto.mfaToken) {
      return {
        step: 'MFA_REQUIRED',
        message: 'Please provide your MFA code',
      };
    }

    const valid = this.mfaService.verifyToken(user.mfaSecret, dto.mfaToken);
    if (!valid) {
      await this.accountLockService.recordFailedAttempt(dto.username);
      throw new UnauthorizedException('Invalid MFA code');
    }
  }

  await this.accountLockService.clearFailedAttempts(dto.username);
  const token = await this.authService.generateToken(user);
  return { success: true, token };
}
```

---

## 6. 密码安全策略

### 6.1 密码强度校验

```bash
npm install zxcvbn
```

```typescript
// src/auth/dto/register.dto.ts
import { IsString, MinLength, Matches, Validate } from 'class-validator';
import { PasswordStrengthValidator } from '../validators/password-strength.validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  @Validate(PasswordStrengthValidator)
  password: string;
}
```

```typescript
// src/auth/validators/password-strength.validator.ts
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import * as zxcvbn from 'zxcvbn';

@ValidatorConstraint({ name: 'passwordStrength', async: false })
export class PasswordStrengthValidator implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    const result = zxcvbn(password);
    // score 0-4, 要求至少 3（强密码）
    return result.score >= 3;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password is too weak and easily guessable. Please use a stronger password.';
  }
}
```

### 6.2 密码哈希与历史

```typescript
// src/auth/services/password.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async isPasswordReused(userId: string, newPassword: string): Promise<boolean> {
    // 检查最近 5 个历史密码
    const historyKey = `password_history:${userId}`;
    const history = await this.redis.lrange(historyKey, 0, 4);

    for (const oldHash of history) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        return true;
      }
    }

    return false;
  }

  async savePasswordHistory(userId: string, passwordHash: string): Promise<void> {
    const historyKey = `password_history:${userId}`;
    await this.redis.lpush(historyKey, passwordHash);
    await this.redis.ltrim(historyKey, 0, 4); // 只保留最近 5 个
  }
}
```

---

## 7. 安全日志与监控告警

### 7.1 登录审计日志

```typescript
// src/auth/services/audit-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export enum AuditAction {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(action: AuditAction, details: {
    username?: string;
    userId?: string;
    ip: string;
    userAgent: string;
    metadata?: Record<string, any>;
  }) {
    const log = this.auditRepo.create({
      action,
      username: details.username,
      userId: details.userId,
      ipAddress: details.ip,
      userAgent: details.userAgent,
      metadata: details.metadata,
      createdAt: new Date(),
    });

    await this.auditRepo.save(log);

    // 高风险事件实时告警
    if (action === AuditAction.ACCOUNT_LOCKED) {
      await this.sendAlert(details);
    }
  }

  private async sendAlert(details: any) {
    // 接入钉钉/飞书/企业微信 Webhook
    // 检测到短时间内大量账号被锁定，触发安全告警
    const recentLocks = await this.auditRepo.count({
      where: {
        action: AuditAction.ACCOUNT_LOCKED,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 最近 5 分钟
      },
    });

    if (recentLocks > 10) {
      // 触发告警：可能是分布式暴力破解攻击
      await this.notifySecurityTeam({
        level: 'CRITICAL',
        message: `Detected ${recentLocks} account locks in 5 minutes. Possible brute force attack.`,
        details,
      });
    }
  }

  private async notifySecurityTeam(alert: any) {
    // 调用 Webhook 发送告警
    // 实现略...
  }
}
```

### 7.2 Entity 定义

```typescript
// src/auth/entities/audit-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  userId: string;

  @Column()
  ipAddress: string;

  @Column({ type: 'text' })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 8. 中间件拦截异常登录

### 8.1 请求指纹中间件

```typescript
// src/auth/middleware/fingerprint.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export interface RequestWithFingerprint extends Request {
  fingerprint: string;
}

@Injectable()
export class FingerprintMiddleware implements NestMiddleware {
  use(req: RequestWithFingerprint, res: Response, next: NextFunction) {
    const data = [
      req.ip,
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
    ].join('|');

    req.fingerprint = crypto.createHash('sha256').update(data).digest('hex');
    next();
  }
}
```

### 8.2 异常行为检测

```typescript
// src/auth/services/anomaly-detection.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class AnomalyDetectionService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async detectSuspiciousActivity(fingerprint: string, username: string): Promise<{
    suspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // 1. 同一指纹短时间内尝试多个不同账号
    const multiAccountKey = `fingerprint_accounts:${fingerprint}`;
    await this.redis.sadd(multiAccountKey, username);
    await this.redis.expire(multiAccountKey, 3600);
    const accountCount = await this.redis.scard(multiAccountKey);

    if (accountCount > 5) {
      reasons.push(`Fingerprint tried ${accountCount} different accounts in 1 hour`);
    }

    // 2. 同一账号被大量不同指纹尝试
    const multiFpKey = `account_fingerprints:${username}`;
    await this.redis.sadd(multiFpKey, fingerprint);
    await this.redis.expire(multiFpKey, 3600);
    const fpCount = await this.redis.scard(multiFpKey);

    if (fpCount > 3) {
      reasons.push(`Account ${username} accessed from ${fpCount} different devices in 1 hour`);
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }
}
```

---

## 9. 管理员解锁接口

```typescript
// src/admin/admin.controller.ts
import { Controller, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { AccountLockService } from '../auth/services/account-lock.service';
import { AuditLogService, AuditAction } from '../auth/services/audit-log.service';
import { AdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly accountLockService: AccountLockService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Patch('users/:username/unlock')
  async unlockAccount(
    @Param('username') username: string,
    @CurrentUser() admin: any,
  ) {
    await this.accountLockService.clearLock(username);

    await this.auditLogService.log(AuditAction.ACCOUNT_UNLOCKED, {
      username,
      metadata: { unlockedBy: admin.username, reason: 'Manual admin unlock' },
      ip: admin.ip,
      userAgent: admin.userAgent,
    });

    return { success: true, message: `Account ${username} has been unlocked` };
  }
}
```

---

## 10. 环境配置汇总

```env
# .env

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# reCAPTCHA v3
RECAPTCHA_SECRET_KEY=your_secret_key
RECAPTCHA_SITE_KEY=your_site_key

# Login lock settings
LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCK_DURATION_MINUTES=30

# Throttling
THROTTLE_TTL=60
THROTTLE_LIMIT=5

# MFA
MFA_ENABLED=true
MFA_ISSUER=MyApp

# Alert Webhook
SECURITY_ALERT_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx
```

---

## 11. 依赖安装命令

```bash
# 核心依赖
npm install @nestjs/throttler @liaoliaots/nestjs-redis ioredis bcrypt class-validator class-transformer

# 可选：MFA + CAPTCHA
npm install speakeasy qrcode @nestjs/axios axios

# 可选：密码强度
npm install zxcvbn

# 可选：TypeORM 审计日志
npm install @nestjs/typeorm typeorm pg
```

---

## 12. 防御效果总结

| 攻击场景 | 防御措施 | 效果 |
|----------|----------|------|
| 单一账号暴力破解 | 失败计数 + 账号锁定 | 5 次失败后锁定 30 分钟 |
| 高频请求 | IP 限流 (Throttler) | 1 分钟 3 次登录上限 |
| 分布式多 IP 攻击 | Redis 共享计数 + 异常检测 | 跨实例统一锁定 |
| 自动化脚本 | CAPTCHA | 人机验证拦截 |
| 密码泄露撞库 | MFA | 第二层认证保护 |
| 弱口令 | 密码强度校验 | Zxcvbn 强制强密码 |
| 历史密码复用 | 密码历史记录 | 禁止复用最近 5 个密码 |
| 异常行为 | 指纹分析 + 审计日志 | 实时告警安全团队 |
