# Mongoose 子文档去重方案文档

## findOneAndUpdate + $push + $ne — 并发安全防重复插入

---

## 1. 方案概述

当子文档包含动态生成的 `ObjectId`（或时间戳等不可控字段）时，`$addToSet` 会失效，因为 MongoDB 将其视为两份完全不同的 BSON 对象。本方案通过 **`findOneAndUpdate` + `$push` + `$ne`** 组合，利用 MongoDB 文档级原子锁，在**同一个父文档**内按业务字段（如 `userId`）实现并发安全的去重插入。

---

## 2. 核心原理

MongoDB 的 `findAndModify` 操作在**单个文档级别是原子的**。通过前置查询条件 `'children.userId': { $ne: value }`，确保只有当数组中**不存在**该 `userId` 时才执行 `$push`；并发请求同时到达时，只有一个能通过查询条件并完成写入，其余请求因匹配不上而返回 `null`。

**执行流程：**

```
请求A ──► 查询 _id=parentId 且 children.userId ≠ 'u123' ──► 命中，获取写锁
请求B ──► 查询相同条件 ──► 等待文档锁（请求A尚未释放）

请求A ──► 执行 $push，children 加入 u123 ──► 释放锁
请求B ──► 再次查询 ──► 发现已存在 u123，条件不满足 ──► 返回 null（未插入）
```

---

## 3. 完整代码实现

### 3.1 Schema 定义

```javascript
const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'member' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true }); // 子文档自动生成 _id

const parentSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  children: {
    type: [childSchema],
    default: []
  }
});

// ⚠️ 如果按 groupName 等字段查询父文档，建议加唯一索引防止 upsert 创建重复父文档
// parentSchema.index({ groupName: 1 }, { unique: true });

const Parent = mongoose.model('Parent', parentSchema);
module.exports = { Parent };
```

### 3.2 核心插入方法

```javascript
const { Types } = require('mongoose');
const { Parent } = require('./models');

/**
 * 向父文档的子文档数组中插入一条记录
 * 按 userId 去重，如果已存在则返回 null
 * 
 * @param {string|ObjectId} parentId - 父文档 ID
 * @param {Object} childData - 子文档数据，必须包含 userId
 * @returns {Promise<Object|null>} 更新后的父文档，若重复返回 null
 */
async function addChildUnique(parentId, childData) {
  // 校验必填字段
  if (!childData || !childData.userId) {
    throw new Error('childData 必须包含 userId');
  }

  const result = await Parent.findOneAndUpdate(
    {
      _id: parentId,
      // 核心：前置条件，确保数组中不存在该 userId
      'children.userId': { $ne: childData.userId }
    },
    {
      $push: { children: childData }
    },
    {
      new: true,          // 返回更新后的文档
      runValidators: true // 执行 Schema 校验
    }
  );

  return result; // 若重复则返回 null
}
```

### 3.3 使用示例

```javascript
async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/test');
    
    // 先创建父文档
    const parent = await Parent.create({ groupName: '技术部', children: [] });
    const parentId = parent._id;

    // 场景1：正常插入
    const child1 = { userId: 'u1001', name: '张三', role: 'developer' };
    const result1 = await addChildUnique(parentId, child1);
    console.log('插入成功:', result1 ? 'OK' : '重复未插入');

    // 场景2：重复插入（同一 userId）
    const child2 = { userId: 'u1001', name: '张三-重名', role: 'designer' };
    const result2 = await addChildUnique(parentId, child2);
    console.log('重复插入结果:', result2 === null ? '被拦截（未插入）' : '异常');

    // 场景3：不同 userId，正常插入
    const child3 = { userId: 'u1002', name: '李四' };
    const result3 = await addChildUnique(parentId, child3);
    console.log('不同用户插入:', result3 ? 'OK' : '失败');

  } catch (err) {
    console.error('错误:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
```

---

## 4. 并发安全测试

以下代码模拟 10 个并发请求同时插入**相同** `userId`，验证最终只保留 1 条：

```javascript
async function testConcurrency() {
  await mongoose.connect('mongodb://localhost:27017/test');
  
  const parent = await Parent.create({ groupName: '并发测试组', children: [] });
  const parentId = parent._id;

  // 模拟 10 个并发请求
  const promises = Array.from({ length: 10 }, (_, i) => 
    addChildUnique(parentId, {
      userId: 'concurrent-user',
      name: `请求-${i}`,
      role: 'tester'
    })
  );

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r !== null).length;
  const failCount = results.filter(r => r === null).length;

  console.log(`成功插入: ${successCount} 次`); // 期望输出: 1
  console.log(`被拦截（重复）: ${failCount} 次`); // 期望输出: 9

  // 验证数据库最终状态
  const doc = await Parent.findById(parentId);
  console.log('最终子文档数:', doc.children.length); // 期望输出: 1
  console.log('子文档 userId:', doc.children[0].userId);
}

testConcurrency().finally(() => mongoose.disconnect());
```

---

## 5. 关键注意事项

### 5.1 返回值判断

| 返回值 | 含义 | 处理建议 |
|--------|------|----------|
| `Document`（对象） | 插入成功 | 正常返回给客户端 |
| `null` | 未匹配到文档 | 需要二次查询区分"父文档不存在"还是"已存在重复" |

**二次校验代码：**

```javascript
const result = await addChildUnique(parentId, childData);

if (!result) {
  const exists = await Parent.exists({
    _id: parentId,
    'children.userId': childData.userId
  });
  
  if (exists) {
    console.log('❌ 子文档已存在，未重复插入');
  } else {
    console.log('❌ 父文档不存在');
  }
}
```

### 5.2 父文档不存在 vs. 子文档重复

上述方案中 `null` 的语义是模糊的。如果你需要**明确区分**这两种情况，应拆分为两步查询（非原子，但信息更明确）：

```javascript
async function addChildUniqueExplicit(parentId, childData) {
  const parent = await Parent.findById(parentId);
  if (!parent) {
    throw new Error('父文档不存在');
  }
  
  const exists = parent.children.some(c => c.userId === childData.userId);
  if (exists) {
    throw new Error('子文档已存在');
  }

  // 这里可以安全 push，因为中间可能被并发修改
  // 如果需要绝对并发安全，仍然需要 findOneAndUpdate
  return Parent.findOneAndUpdate(
    { _id: parentId, 'children.userId': { $ne: childData.userId } },
    { $push: { children: childData } },
    { new: true }
  );
}
```

### 5.3 索引建议

如果频繁按 `children.userId` 查询，建议建立**多键索引**（Multikey Index）：

```javascript
parentSchema.index({ 'children.userId': 1 });
```

### 5.4 数组大小限制

MongoDB 单个文档大小上限为 **16MB**。如果 `children` 数组可能无限增长（如用户动态、消息记录），**强烈建议拆分为独立 Collection**，并用复合唯一索引：

```javascript
// 子文档独立 Collection
const childSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  userId: { type: String, required: true },
  name: String
});

// 复合唯一索引：同一个父文档下 userId 唯一
childSchema.index({ parentId: 1, userId: 1 }, { unique: true });
```

---

## 6. 方案对比

| 特性 | `$addToSet` | `findOneAndUpdate` + `$ne` | 独立 Collection + 唯一索引 |
|------|-------------|---------------------------|---------------------------|
| 并发安全 | ✅ 原子 | ✅ 原子 | ✅ 事务级 |
| 按业务字段去重 | ❌ 不支持 | ✅ 支持 | ✅ 支持 |
| 子文档含 `_id` | ❌ 失效 | ✅ 正常 | ✅ 正常 |
| 性能 | 快 | 快 | 最快（查询更灵活） |
| 数组大小限制 | 受 16MB 约束 | 受 16MB 约束 | 无限制 |
| 适用场景 | 静态子文档 | 中小规模数组 | 大规模/高频写入 |

---

## 7. 总结

> **核心公式：**  
> `findOneAndUpdate` + `{ 'children.field': { $ne: value } }` + `$push`  
> = 按任意业务字段去重 + 并发安全 + 无需事务开销

该方案在绝大多数"一个父文档内子数组去重"场景下是最优解：比事务轻量，比 `$addToSet` 灵活，且天然防并发。

若数组可能无限增长，请及时迁移至独立 Collection，避免单文档膨胀导致性能劣化。
