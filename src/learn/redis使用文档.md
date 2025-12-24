ioredis和redis这2个包有什么区别

---


ioredis 和 redis 两个 npm 包的区别：

**1. 维护状态**
- `ioredis`：活跃维护，推荐使用
- `redis`：旧版本（v3）已停止维护，v4+ 重新活跃

**2. API 风格**
```javascript
// ioredis - 默认 Promise
const Redis = require('ioredis');
const redis = new Redis();
await redis.set('key', 'value');
const value = await redis.get('key');

// redis v3 - 回调风格
const redis = require('redis');
const client = redis.createClient();
client.set('key', 'value', (err, reply) => {});

// redis v4+ - Promise 支持
const redis = require('redis');
const client = redis.createClient();
await client.connect();
await client.set('key', 'value');
```

**3. 集群支持**
```javascript
// ioredis - 原生支持集群
const Redis = require('ioredis');
const cluster = new Redis.Cluster([
  { host: '127.0.0.1', port: 6379 },
  { host: '127.0.0.1', port: 6380 },
]);

// redis v4+ - 也支持集群
const redis = require('redis');
const cluster = redis.createCluster({
  rootNodes: [
    { url: 'redis://127.0.0.1:6379' },
    { url: 'redis://127.0.0.1:6380' },
  ],
});
```

**4. 哨兵模式**
```javascript
// ioredis - 简单配置
const redis = new Redis({
  sentinels: [
    { host: 'localhost', port: 26379 },
    { host: 'localhost', port: 26380 },
  ],
  name: 'mymaster',
});

// redis v4+ - 也支持
const client = redis.createClient({
  sentinel: {
    sentinels: [{ host: 'localhost', port: 26379 }],
    name: 'mymaster',
  },
});
```

**5. Pipeline**
```javascript
// ioredis
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.get('key1');
const results = await pipeline.exec();

// redis v4+
const results = await client
  .multi()
  .set('key1', 'value1')
  .get('key1')
  .exec();
```

**6. 性能和功能对比**

| 特性 | ioredis | redis v4+ |
|------|---------|-----------|
| Promise 支持 | ✅ 原生 | ✅ 原生 |
| 集群支持 | ✅ 优秀 | ✅ 良好 |
| 哨兵支持 | ✅ 优秀 | ✅ 良好 |
| Lua 脚本 | ✅ | ✅ |
| 自动重连 | ✅ | ✅ |
| TypeScript | ✅ | ✅ |
| 文档 | 完善 | 完善 |

**推荐选择：**
```javascript
// 推荐 ioredis（更成熟稳定）
npm install ioredis

// 或 redis v4+（官方包）
npm install redis
```

**总结：**
- `ioredis`：功能更丰富，集群支持更好，社区首选
- `redis v4+`：官方包，功能追赶中，也是不错的选择
- 两者都支持 Promise，性能相近
- 企业项目推荐 `ioredis`

---

给我一个企业级流程使用Redis案例

---

企业级 Redis 使用案例 - 分布式任务队列系统：

```typescript
import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisQueueService {
  private redis: Redis;
  private subscriber: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
    this.subscriber = new Redis();
  }

  // 1. 分布式锁
  async acquireLock(lockKey: string, timeout: number = 10): Promise<boolean> {
    const result = await this.redis.set(lockKey, '1', 'EX', timeout, 'NX');
    return result === 'OK';
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.redis.del(lockKey);
  }

  // 2. 任务队列
  async addTask(queue: string, task: any): Promise<void> {
    await this.redis.lpush(queue, JSON.stringify(task));
    await this.redis.publish(`${queue}:notify`, 'new_task');
  }

  async getTask(queue: string): Promise<any> {
    const task = await this.redis.rpop(queue);
    return task ? JSON.parse(task) : null;
  }

  async getTaskBlocking(queue: string, timeout: number = 0): Promise<any> {
    const result = await this.redis.brpop(queue, timeout);
    return result ? JSON.parse(result[1]) : null;
  }

  // 3. 延迟队列（使用有序集合）
  async addDelayTask(queue: string, task: any, delaySeconds: number): Promise<void> {
    const executeTime = Date.now() + delaySeconds * 1000;
    await this.redis.zadd(`${queue}:delay`, executeTime, JSON.stringify(task));
  }

  async getReadyTasks(queue: string): Promise<any[]> {
    const now = Date.now();
    const tasks = await this.redis.zrangebyscore(`${queue}:delay`, 0, now);
    if (tasks.length > 0) {
      await this.redis.zremrangebyscore(`${queue}:delay`, 0, now);
    }
    return tasks.map(t => JSON.parse(t));
  }

  // 4. 限流器（令牌桶）
  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    return current <= limit;
  }

  // 5. 缓存（带过期时间）
  async setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async getCache(key: string): Promise<any> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // 6. 会话管理
  async setSession(sessionId: string, data: any, ttl: number = 1800): Promise<void> {
    await this.redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
  }

  async getSession(sessionId: string): Promise<any> {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async refreshSession(sessionId: string, ttl: number = 1800): Promise<void> {
    await this.redis.expire(`session:${sessionId}`, ttl);
  }

  // 7. 计数器和统计
  async incrementCounter(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  async getCounter(key: string): Promise<number> {
    const value = await this.redis.get(key);
    return value ? parseInt(value) : 0;
  }

  // 8. 排行榜
  async addScore(leaderboard: string, user: string, score: number): Promise<void> {
    await this.redis.zadd(leaderboard, score, user);
  }

  async getTopN(leaderboard: string, n: number): Promise<any[]> {
    return await this.redis.zrevrange(leaderboard, 0, n - 1, 'WITHSCORES');
  }

  async getUserRank(leaderboard: string, user: string): Promise<number> {
    const rank = await this.redis.zrevrank(leaderboard, user);
    return rank !== null ? rank + 1 : -1;
  }

  // 9. 发布订阅
  async publish(channel: string, message: any): Promise<void> {
    await this.redis.publish(channel, JSON.stringify(message));
  }

  subscribe(channel: string, callback: (message: any) => void): void {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        callback(JSON.parse(msg));
      }
    });
  }

  // 10. 布隆过滤器（防止缓存穿透）
  async addToBloomFilter(key: string, value: string): Promise<void> {
    const hash1 = this.hash(value, 1);
    const hash2 = this.hash(value, 2);
    await this.redis.setbit(key, hash1, 1);
    await this.redis.setbit(key, hash2, 1);
  }

  async checkBloomFilter(key: string, value: string): Promise<boolean> {
    const hash1 = this.hash(value, 1);
    const hash2 = this.hash(value, 2);
    const bit1 = await this.redis.getbit(key, hash1);
    const bit2 = await this.redis.getbit(key, hash2);
    return bit1 === 1 && bit2 === 1;
  }

  private hash(str: string, seed: number): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * seed + str.charCodeAt(i)) % 1000000;
    }
    return hash;
  }
}

// 使用示例
@Injectable()
export class OrderService {
  constructor(private redisQueue: RedisQueueService) {}

  async createOrder(orderData: any): Promise<void> {
    const lockKey = `order:lock:${orderData.userId}`;
    
    // 分布式锁防止重复下单
    if (await this.redisQueue.acquireLock(lockKey, 5)) {
      try {
        // 限流检查
        const canProceed = await this.redisQueue.checkRateLimit(
          `order:rate:${orderData.userId}`,
          10,
          60
        );
        
        if (!canProceed) {
          throw new Error('请求过于频繁');
        }

        // 添加订单任务到队列
        await this.redisQueue.addTask('order:queue', orderData);

        // 缓存订单信息
        await this.redisQueue.setCache(
          `order:${orderData.orderId}`,
          orderData,
          3600
        );

        // 更新用户订单计数
        await this.redisQueue.incrementCounter(`user:${orderData.userId}:orders`);

        // 发布订单创建事件
        await this.redisQueue.publish('order:created', orderData);

      } finally {
        await this.redisQueue.releaseLock(lockKey);
      }
    }
  }

  // 处理订单任务
  async processOrders(): Promise<void> {
    while (true) {
      const task = await this.redisQueue.getTaskBlocking('order:queue', 5);
      if (task) {
        console.log('处理订单:', task);
        // 处理订单逻辑
      }
    }
  }
}
```

**核心功能：**
- 分布式锁：防止并发问题
- 任务队列：异步处理
- 延迟队列：定时任务
- 限流器：防止滥用
- 缓存：提升性能
- 会话管理：用户状态
- 排行榜：实时统计
- 发布订阅：事件驱动
- 布隆过滤器：防缓存穿透


---

使用Nestjs如何连接Redis服务器

---


NestJS 连接 Redis 服务器的方法：

**方案1：使用 @liaoliaots/nestjs-redis（推荐）**

```bash
npm install @liaoliaots/nestjs-redis ioredis
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
        password: 'your-password', // 可选
        db: 0,
      },
    }),
  ],
})
export class AppModule {}

// 使用
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setValue(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async getValue(key: string) {
    return await this.redis.get(key);
  }
}
```

**方案2：使用 nestjs-redis**

```bash
npm install nestjs-redis ioredis
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      password: 'your-password',
    }),
  ],
})
export class AppModule {}
```

**方案3：直接使用 ioredis**

```bash
npm install ioredis
```

```typescript
// redis.provider.ts
import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    return new Redis({
      host: 'localhost',
      port: 6379,
      password: 'your-password',
    });
  },
};

// app.module.ts
import { Module } from '@nestjs/common';
import { redisProvider } from './redis.provider';

@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class AppModule {}

// 使用
import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.provider';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async setValue(key: string, value: string) {
    await this.redis.set(key, value);
  }
}
```

**推荐使用 `@liaoliaots/nestjs-redis`**，功能完善且维护活跃。

---

如何使用ioredis使用redis的基本功能，请写出例子

---


使用 ioredis 的基本功能示例：

```javascript
const Redis = require('ioredis');

// 连接 Redis
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: 'your-password', // 可选
  db: 0,
});

// 1. 字符串操作
await redis.set('key', 'value');
await redis.set('key', 'value', 'EX', 60); // 设置60秒过期
const value = await redis.get('key');
await redis.del('key');

// 2. 哈希操作
await redis.hset('user:1', 'name', 'John');
await redis.hset('user:1', 'age', 30);
await redis.hmset('user:2', { name: 'Jane', age: 25 });
const name = await redis.hget('user:1', 'name');
const user = await redis.hgetall('user:1'); // { name: 'John', age: '30' }
await redis.hdel('user:1', 'age');

// 3. 列表操作
await redis.lpush('list', 'item1', 'item2'); // 左侧插入
await redis.rpush('list', 'item3'); // 右侧插入
const item = await redis.lpop('list'); // 左侧弹出
const items = await redis.lrange('list', 0, -1); // 获取所有

// 4. 集合操作
await redis.sadd('set', 'member1', 'member2');
const exists = await redis.sismember('set', 'member1'); // 1
const members = await redis.smembers('set');
await redis.srem('set', 'member1');

// 5. 有序集合操作
await redis.zadd('rank', 100, 'user1', 200, 'user2');
const rank = await redis.zrange('rank', 0, -1); // 按分数升序
const rankWithScores = await redis.zrange('rank', 0, -1, 'WITHSCORES');
await redis.zincrby('rank', 10, 'user1'); // 增加分数

// 6. 键操作
await redis.expire('key', 60); // 设置过期时间
const ttl = await redis.ttl('key'); // 查看剩余时间
const exists = await redis.exists('key'); // 检查是否存在
const keys = await redis.keys('user:*'); // 查找匹配的键

// 7. 事务
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.get('key1');
const results = await pipeline.exec();

// 8. 发布订阅
const pub = new Redis();
const sub = new Redis();

sub.subscribe('channel', (err, count) => {
  console.log(`订阅了 ${count} 个频道`);
});

sub.on('message', (channel, message) => {
  console.log(`收到消息: ${message}`);
});

pub.publish('channel', 'Hello Redis');

// 9. 关闭连接
await redis.quit();
```

**常用方法总结：**
```javascript
// 字符串
redis.set(key, value)
redis.get(key)
redis.incr(key)
redis.decr(key)

// 哈希
redis.hset(key, field, value)
redis.hget(key, field)
redis.hgetall(key)

// 列表
redis.lpush(key, value)
redis.rpush(key, value)
redis.lrange(key, start, stop)

// 集合
redis.sadd(key, member)
redis.smembers(key)

// 有序集合
redis.zadd(key, score, member)
redis.zrange(key, start, stop)
```

---