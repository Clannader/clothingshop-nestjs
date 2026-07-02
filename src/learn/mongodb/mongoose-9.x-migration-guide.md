# Mongoose 9.x 迁移指南：从 8.x 到 9.x 的关键变更详解

> **文档类型**：技术迁移指南
> **目标读者**：正在使用 Mongoose 8.x 并计划升级到 9.x 的开发者
> **Mongoose 版本**：9.x（截至 2026-07 最新 9.7.x）
> **对应 MongoDB Node.js 驱动**：v7.x

---

## 目录

1. [MongoDB Driver 升级](#1-mongodb-driver-升级)
2. [移除回调式 pre 中间件](#2-移除回调式-pre-中间件)
3. [UUID 类型变更](#3-uuid-类型变更)
4. [查询空值行为变更](#4-查询空值行为变更)
5. [Update Pipeline 默认禁用](#5-update-pipeline-默认禁用)
6. [异步化验证器](#6-异步化验证器)
7. [移除 bson 直接依赖](#7-移除-bson-直接依赖)
8. [移除浏览器构建](#8-移除浏览器构建)
9. [TypeScript 类型收紧](#9-typescript-类型收紧)
10. [升级前的检查清单](#10-升级前的检查清单)
11. [升级步骤建议](#11-升级步骤建议)
12. [升级后的验证](#12-升级后的验证)

---

## 三、9.x 与 8.x 的关键差异（Breaking Changes）

### 1. MongoDB Driver 升级

Mongoose 9.x 将底层 MongoDB Node.js 驱动从 **v6 升级至 v7**，这是本次升级的核心变化。

**影响范围**：
- 所有数据库连接、查询、聚合操作
- 驱动 API 的变化会间接影响 Mongoose 行为
- 连接字符串参数和选项的变更

**需要关注的驱动变更**：
- `mongodb` 包升级到 v7.2+
- `tlsCertificateKeyFile` 等 TLS 选项格式变更
- 批量写入（BulkWrite）行为微调
- `findOneAndUpdate` 的 `rawResult` 选项变更

**升级前准备**：
- 先查看项目 `package.json`，确认 `mongodb` 是否被显式引用
- 如有直接调用 `mongodb` 驱动的地方，先查阅 [MongoDB Node.js 驱动 v7 迁移指南](https://www.mongodb.com/docs/drivers/node/current/upgrade/)

---

### 2. 移除回调式 pre 中间件

**变更内容**：不再支持回调式的 `pre()` 中间件钩子，只支持返回 Promise 或 `async/await` 的异步中间件。

**旧写法（8.x 及以下，已被移除）**：

```javascript
// ❌ 不再支持 - 回调式 pre 中间件
schema.pre('save', function(next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});
```

**新写法（9.x，使用 async/await）**：

```javascript
// ✅ 正确写法 - 异步/await 形式
schema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
```

**检查方法**：
- 全局搜索项目中的 `schema.pre(`、`schema.post(`
- 查看是否有使用 `next()` 作为参数的钩子
- 搜索正则：`pre\s*\(\s*['"]` 和 `function\s*\([^)]*next`

**注意事项**：
- 不涉及 `pre()` / `post()` 的回调 API 变更（如查询回调 `.find({}, cb)`）仍然支持
- 只有 **中间件钩子** 的 `next()` 回调形式被移除
- 使用 Promise 的 `next().then()` 形式也不被支持，必须改用 `async` 函数

---

### 3. UUID 类型变更

**变更内容**：`Schema.Types.UUID` 在查询结果和 `lean()` 结果中不再返回字符串，而是返回 **BSON UUID 对象**。

**旧行为（8.x）**：

```javascript
// ❌ 8.x 行为 - 返回字符串
const doc = await MyModel.findById(id);
console.log(doc.uuidField); // '550e8400-e29b-41d4-a716-446655440000' (字符串)
```

**新行为（9.x）**：

```javascript
// ✅ 9.x 行为 - 返回 BSON UUID 对象
const doc = await MyModel.findById(id);
console.log(doc.uuidField); // UUID('550e8400-e29b-41d4-a716-446655440000') (BSON UUID)

// 需要调用 toString() 或 toJSON() 获取字符串
console.log(doc.uuidField.toString()); // '550e8400-e29b-41d4-a716-446655440000'
```

**迁移策略**：

```javascript
// 方案一：手动转换（逐处修改）
const uuidStr = doc.uuidField.toString();

// 方案二：在 schema 中设置 toString 转换（全局处理）
schema.set('toJSON', { transform: (doc, ret) => {
  if (ret.uuidField instanceof mongoose.Types.UUID) {
    ret.uuidField = ret.uuidField.toString();
  }
  return ret;
}});

// 方案三：在 Lean 查询后处理
const doc = await MyModel.findById(id).lean();
const uuidStr = doc.uuidField?.toString();
```

**检查方法**：
- 搜索 `Schema.Types.UUID`、`mongoose.Types.UUID`
- 搜索涉及 UUID 字段的比较、序列化操作
- 检查是否有 JSON.stringify 处理含 UUID 的文档

---

### 4. 查询空值行为变更

**变更内容**：`findOne()`、`find()` 等查询方法传入 `null`、`undefined` 或空对象时，不再返回任意文档，而是 **抛出 ValidationError**。

**旧行为（8.x）**：

```javascript
// ❌ 8.x 行为 - 危险！返回第一个文档
const user = await User.findOne(null);
// 等同于 User.findOne({})，返回集合中第一个文档
```

**新行为（9.x）**：

```javascript
// ✅ 9.x 行为 - 安全！抛出错误
try {
  const user = await User.findOne(null); // 抛出 ValidationError
} catch (err) {
  console.error(err.message); // "Query must not be null or undefined"
}
```

**常见触发场景**：

```javascript
// 场景一：变量可能为 null 的查询
const userId = req.params.id; // 可能为 undefined
const user = await User.findById(userId); // 9.x 如果 userId 为 null 会报错

// 场景二：条件查询中 filter 为 falsy
const filter = getFilter(); // 可能返回 null
const docs = await Model.find(filter); // 9.x 会报错

// 场景三：解构赋值中的空值
const { query } = req.body; // 可能为 undefined
const docs = await Model.findOne(query); // 9.x 会报错
```

**迁移策略**：

```javascript
// 方案一：显式检查并处理空值
const userId = req.params.id;
if (!userId) {
  return res.status(400).json({ error: 'userId is required' });
}
const user = await User.findById(userId);

// 方案二：使用空对象默认值
const filter = getFilter() || {};
const docs = await Model.find(filter);

// 方案三：使用可选链配合默认值
const query = req.body?.query ?? {};
const doc = await Model.findOne(query);
```

**检查方法**：
- 全局搜索 `findOne(`, `find(`, `findById(`
- 检查查询参数是否来自可能为 null/undefined 的变量
- 搜索正则：`findOne\s*\(\s*[^{]` 和 `find\s*\(\s*[^{]`

---

### 5. Update Pipeline 默认禁用

**变更内容**：聚合管道（Update Pipeline）形式的 `updateOne()`、`updateMany()`、`findOneAndUpdate()` 默认被禁用，需显式启用。

**旧写法（8.x）**：

```javascript
// ❌ 8.x 直接支持 - 9.x 默认会报错
await User.updateOne(
  { _id: userId },
  [
    { $set: { updatedAt: new Date() } },
    { $set: { status: 'active' } }
  ]
);
```

**新写法（9.x）**：

```javascript
// ✅ 9.x 需要显式启用
await User.updateOne(
  { _id: userId },
  [
    { $set: { updatedAt: new Date() } },
    { $set: { status: 'active' } }
  ],
  { updatePipeline: true } // 显式启用
);
```

**全局启用方案**：

```javascript
// 在 schema 或 model 层面全局启用
const schema = new mongoose.Schema({ ... });
schema.set('updatePipeline', true);

// 或在 Mongoose 实例层面
mongoose.set('updatePipeline', true);
```

**为什么做这个变更**：
- Update Pipeline 是 MongoDB 4.2+ 的高级特性，很多开发者误用会导致数据丢失
- 默认禁用可以防止意外将数组查询误用为 update pipeline
- 需要显式启用确保开发者了解该特性

**检查方法**：
- 搜索 `updateOne(`、`updateMany(`、`findOneAndUpdate(`
- 检查第二个参数是否为数组形式 `[{ $set: ... }]`

---

### 6. 异步化验证器

**变更内容**：验证器（Validators）、Update Validators 和 `doValidate()` 改为**异步执行**。

**影响范围**：
- Schema 中定义的自定义验证器
- `updateOne()`、`updateMany()`、`findOneAndUpdate()` 中的 update validators
- 手动调用的 `doc.validate()`、`doc.doValidate()`

**旧写法（8.x）**：

```javascript
// ❌ 8.x 同步验证器 - 已不兼容
schema.path('email').validate(function(value) {
  return /^\S+@\S+\.\S+$/.test(value); // 同步返回 boolean
}, 'Invalid email format');
```

**新写法（9.x）**：

```javascript
// ✅ 9.x 异步验证器
schema.path('email').validate({
  validator: async function(value) {
    // 现在可以是 async 函数
    const exists = await User.findOne({ email: value });
    return !exists; // 返回 boolean 或 Promise<boolean>
  },
  message: 'Email already exists'
});
```

**Update Validators 的变更**：

```javascript
// 9.x 中 update validators 不再自动同步执行
// 需要在 await 中正确处理
await User.updateOne(
  { _id: id },
  { email: 'test@example.com' },
  { runValidators: true } // 验证器现在是异步的
);
```

**注意事项**：
- 同步验证器仍然可以工作（返回 boolean），但内部执行已改为异步
- 如果验证器依赖外部资源（如数据库查询、API 调用），必须使用 `async/await`
- `doc.validateSync()` 仍然可用，但会跳过异步验证步骤

**检查方法**：
- 搜索 `schema.path(...).validate(`、`schema.path(...).validateSync(`
- 检查 `runValidators: true` 的 update 操作
- 查看自定义验证器是否包含异步操作（数据库查询、HTTP 请求等）

---

### 7. 移除 bson 直接依赖

**变更内容**：Mongoose 不再直接依赖 `bson` 包，而是通过 `mongodb` 驱动暴露的 `bson` 模块获取。

**旧写法（8.x）**：

```javascript
// ❌ 8.x 直接从 bson 包导入
const { ObjectId, Decimal128, Timestamp } = require('bson');
// 或
import { ObjectId } from 'bson';
```

**新写法（9.x）**：

```javascript
// ✅ 9.x 从 mongodb 驱动导入
const { ObjectId, Decimal128, Timestamp } = require('mongodb').BSON;
// 或
const { ObjectId } = require('mongoose').mongo;
// 或直接从 mongoose 获取
const { ObjectId } = mongoose.Types;
```

**最佳实践**：

```javascript
// 推荐：始终通过 mongoose 获取 BSON 类型
const mongoose = require('mongoose');
const { ObjectId, Decimal128, UUID } = mongoose.Types;

// 或
const { ObjectId } = mongoose.Schema.Types.ObjectId;
```

**注意事项**：
- 如果项目中有 `require('bson')` 或 `import { ... } from 'bson'` 的直接引用，需要修改
- `mongoose.Types.ObjectId` 仍然可用，推荐通过此方式引用
- 第三方库如果依赖 `bson` 包，通常不受影响（它们自行管理依赖）

**检查方法**：
- 全局搜索 `require('bson')`、`from 'bson'`、`import .* from ['"]bson['"]`
- 查看 `package.json` 中是否有直接依赖 `bson`

---

### 8. 移除浏览器构建

**变更内容**：Mongoose 包中不再包含浏览器端预构建文件，浏览器构建移至独立的 `@mongoosejs/browser` 包。

**旧用法（8.x）**：

```html
<!-- ❌ 8.x 可以从 mongoose 包获取浏览器构建 -->
<script src="node_modules/mongoose/browser.js"></script>
```

**新用法（9.x）**：

```bash
# 安装独立的浏览器包
npm install @mongoosejs/browser
```

```html
<!-- ✅ 9.x 使用独立包 -->
<script src="node_modules/@mongoosejs/browser/browser.js"></script>
```

**使用场景**：
- 需要在浏览器端（如 Electron 前端、React Native）使用 Mongoose Schema 验证
- 需要在客户端使用 Mongoose 的查询构建器（Query Builder）

**注意事项**：
- 浏览器构建不包含实际的数据库连接功能
- 主要用于 Schema 定义、模型验证、查询构建等客户端操作
- 完整功能仍需在 Node.js 后端运行

**检查方法**：
- 查看是否有 `mongoose/browser` 或 `mongoose/dist/browser` 的引用
- 检查 Webpack/Browserify 配置中是否有 mongoose 的 browser 别名

---

### 9. TypeScript 类型收紧

**变更内容**：TypeScript 类型定义大幅收紧，不再允许隐式 `any` 类型，泛型约束更严格。

### 9.1 `create()` / `insertOne()` 参数类型收紧

**旧写法（8.x，通过编译）**：

```typescript
// ❌ 8.x 允许 - 9.x 报错
const user = await User.create({ unknownField: 'value' } as any);
```

**新写法（9.x）**：

```typescript
// ✅ 9.x 需要匹配 schema 定义的类型
interface IUser {
  name: string;
  email: string;
}

const user = await User.create<IUser>({
  name: 'John',
  email: 'john@example.com'
});
```

### 9.2 `FilterQuery` 不再解析为 `any`

**旧写法（8.x）**：

```typescript
// ❌ 8.x 中 filter 允许任意属性
const filter: FilterQuery<IUser> = { unknownField: 'value' };
// 不会报错，因为 FilterQuery 允许任意属性
```

**新写法（9.x）**：

```typescript
// ✅ 9.x 中 FilterQuery 严格约束为 schema 定义的属性
const filter: FilterQuery<IUser> = { name: 'John' }; // 正确
// const filter: FilterQuery<IUser> = { unknownField: 'value' }; // ❌ 报错
```

### 9.3 其他类型变更

```typescript
// Model 泛型参数变更
// 旧写法（8.x）
const User = mongoose.model('User', schema);

// 新写法（9.x，推荐显式类型）
interface IUser {
  name: string;
  email: string;
}
const User = mongoose.model<IUser>('User', schema);

// LeanDocument 类型变更
// 9.x 中 lean() 返回的类型更精确
const user = await User.findOne().lean<IUser>();
// user 的类型是 IUser，而不是 LeanDocument<IUser>
```

**检查方法**：
- 运行 `npx tsc --noEmit` 查看所有类型错误
- 搜索 `as any`、`as unknown` 的强制类型转换
- 检查 `FilterQuery<>` 的使用位置

---

## 四、升级建议与执行步骤

### 10. 升级前的检查清单

| 检查项 | 操作方法 | 预估工作量 |
|--------|----------|-----------|
| MongoDB Server 版本 | `db.version()` 或 Atlas 控制台 | 若 < 6.0，需先升级 MongoDB |
| Node.js 版本 | `node -v` | 需 ≥ 18.18.0 |
| Mongoose 版本 | `npm list mongoose` | 当前版本 |
| MongoDB 驱动直接引用 | `npm list mongodb` | 检查是否直接依赖 |
| BSON 直接引用 | `npm list bson` | 检查是否直接依赖 |
| 回调式 pre 中间件 | 搜索 `schema.pre(`, `schema.post(` | 中 |
| UUID 类型使用 | 搜索 `UUID`、`Schema.Types.UUID` | 小 |
| 空值查询 | 搜索 `findOne(null`, `findOne(undefined` | 小 |
| Update Pipeline | 搜索 `updateOne([`, `updateMany([` | 小 |
| TypeScript 类型 | 运行 `tsc --noEmit` | 中 |
| 浏览器构建引用 | 搜索 `mongoose/browser` | 小 |

---

### 11. 升级步骤建议

#### 步骤一：环境准备

```bash
# 1. 确认 Node.js 版本
node -v
# 必须 >= 18.18.0

# 2. 确认 MongoDB Server 版本
mongod --version
# 或使用 MongoDB Atlas 控制台查看
# 必须 >= 6.0

# 3. 备份 package.json
复制 package.json 和 package-lock.json
```

#### 步骤二：升级依赖

```bash
# 1. 升级 Mongoose
npm install mongoose@^9.0.0

# 2. 如果直接依赖了 mongodb 驱动，同步升级
npm install mongodb@^7.0.0

# 3. 移除不再需要的 bson 依赖（如存在）
npm uninstall bson

# 4. 安装独立的浏览器包（如需要）
npm install @mongoosejs/browser

# 5. 验证依赖树
npm ls mongoose mongodb bson
```

#### 步骤三：处理 Breaking Changes

按以下优先级处理：

**高优先级（功能影响）**：
1. **查询空值** — 最容易造成生产事故
2. **回调式中间件** — 导致 hooks 不执行或报错
3. **Update Pipeline** — 导致更新操作失败

**中优先级（类型/行为变更）**：
4. **UUID 类型** — 影响数据序列化
5. **BSON 依赖** — 可能导致构建失败
6. **异步验证器** — 影响数据验证逻辑

**低优先级（边缘场景）**：
7. **浏览器构建** — 仅影响前端使用场景
8. **TypeScript 类型** — 编译期问题，不影响运行时

#### 步骤四：逐步修改代码

**处理查询空值（最高优先级）**：

```javascript
// 为所有查询添加防御性检查
// 建议创建工具函数
function safeFindOne(model, query, options = {}) {
  if (query === null || query === undefined) {
    throw new Error('Query must not be null or undefined');
  }
  return model.findOne(query, options);
}

// 或使用 middleware 统一处理
mongoose.plugin((schema) => {
  schema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
    const query = this.getQuery();
    if (!query || Object.keys(query).length === 0) {
      throw new Error('Empty query not allowed');
    }
  });
});
```

**处理回调式中间件**：

```javascript
// 批量替换脚本示例
// 将 function(next) { ... next() } 替换为 async function() { ... }

// 旧代码
schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 新代码
schema.pre('save', async function() {
  this.updatedAt = new Date();
  // 不需要 next()
});
```

**处理 UUID 类型**：

```javascript
// 在 Schema 定义时设置全局转换
const mongoose = require('mongoose');

mongoose.plugin((schema) => {
  schema.eachPath((path, schemaType) => {
    if (schemaType instanceof mongoose.Schema.Types.UUID) {
      schemaType.options.get = (v) => v?.toString();
    }
  });
});
```

#### 步骤五：TypeScript 类型修复

```bash
# 1. 运行类型检查
npx tsc --noEmit

# 2. 修复所有类型错误
# 常见修复模式：

# - 为 Model 添加泛型参数
const User = mongoose.model<IUser>('User', schema);

# - 为查询结果添加类型
const user = await User.findOne().lean<IUser>();

# - 为 create 参数添加类型
const user = await User.create<IUser>({ name, email });

# - 为 FilterQuery 使用正确的类型
const filter: FilterQuery<IUser> = { name: 'John' };
```

#### 步骤六：测试与验证

```bash
# 1. 运行单元测试
npm test

# 2. 运行集成测试（涉及数据库的测试）
npm run test:integration

# 3. 使用 Mongoose 的 debug 模式查看生成的查询
mongoose.set('debug', true);

# 4. 在 staging 环境运行完整的 E2E 测试
```

---

### 12. 升级后的验证

#### 验证清单

| 验证项 | 验证方法 | 通过标准 |
|--------|----------|----------|
| 应用启动 | `npm start` / `node app.js` | 无报错正常启动 |
| 数据库连接 | 查看日志/监控 | 连接成功，无认证错误 |
| CRUD 操作 | 运行测试用例 | 增删改查正常 |
| 中间件执行 | 查看日志/调试 | pre/post hooks 正常触发 |
| 数据验证 | 提交无效数据 | 验证器正确报错 |
| 空值查询 | 传入 null/undefined | 抛出错误而非返回随机文档 |
| UUID 处理 | 查询含 UUID 的文档 | 类型正确，序列化正常 |
| TypeScript 编译 | `tsc --noEmit` | 零类型错误 |
| 性能基线 | 对比升级前后 | 无明显性能下降 |
| 内存泄漏 | 长时间压力测试 | 内存使用稳定 |

#### 回滚方案

```bash
# 如果升级出现问题，快速回滚
# 1. 恢复 package.json
# 2. 恢复 package-lock.json
# 3. 重新安装旧版本
npm install mongoose@^8.0.0

# 4. 如果有数据库 Schema 变更，检查是否需要回滚数据
```

---

## 五、快速参考表

| 变更项 | 8.x 代码 | 9.x 代码 |
|--------|---------|---------|
| MongoDB 驱动 | `mongodb@~6.x` | `mongodb@~7.x` |
| pre 中间件 | `schema.pre('save', function(next) { ... next(); })` | `schema.pre('save', async function() { ... })` |
| UUID 返回 | 字符串 `'uuid'` | BSON UUID 对象（需 `.toString()`） |
| 空值查询 | `findOne(null)` 返回首条 | 抛出 ValidationError |
| Update Pipeline | 直接支持数组 | 需 `{ updatePipeline: true }` |
| BSON 导入 | `require('bson')` | `require('mongoose').Types` |
| 浏览器构建 | `mongoose/browser` | `@mongoosejs/browser` |
| Model 泛型 | `mongoose.model('User', schema)` | `mongoose.model<IUser>('User', schema)` |

---

## 六、参考来源

1. [Mongoose 9.0.0 Release Notes](https://github.com/Automattic/mongoose/releases/tag/9.0.0)
2. [Mongoose 迁移到 9.x 官方指南](https://mongoosejs.com/docs/migrating_to_9.html)
3. [Mongoose 兼容性文档](https://mongoosejs.com/docs/compatibility.html)
4. [MongoDB Node.js 驱动 v7 升级指南](https://www.mongodb.com/docs/drivers/node/current/upgrade/)
5. [Mongoose TypeScript 支持文档](https://mongoosejs.com/docs/typescript.html)
6. [Mongoose GitHub Issues - 9.x 相关讨论](https://github.com/Automattic/mongoose/issues?q=is%3Aissue+label%3A%22breaking+change%22+9.0.0)

---

> **文档生成时间**：2026-07-02
> **适用 Mongoose 版本**：9.x（9.0.0 ~ 9.7.x）
> **作者**：Only Code（AI 结对编程助手）
