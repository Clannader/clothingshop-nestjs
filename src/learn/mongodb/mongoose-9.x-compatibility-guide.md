# Mongoose 9.x 与 MongoDB 版本兼容性指南

> 最后更新：2026-07-02

---

## 一、Mongoose 9.x 支持哪些 MongoDB Server？

**Mongoose 9.x（当前最新 9.7.3）** 依赖 MongoDB Node.js 驱动 **v7.x**（从 9.0.0 升级，9.6.0 进一步升级到 7.2）。

根据 [Mongoose 官方兼容性页面](https://mongoosejs.com/docs/compatibility.html)：

| MongoDB Server | Mongoose 9.x 兼容性 |
|---------------|---------------------|
| **MongoDB 8.0** | ✓ 支持（`^9.0.0`） |
| **MongoDB 7.0** | ✓ 支持（`^9.0.0`） |
| **MongoDB 6.0** | ✓ 支持（`^9.0.0`） |
| MongoDB 5.0 | ✗ 不支持 |
| MongoDB 4.4 | ✗ 不支持 |

**结论**：Mongoose 9.x 仅支持 **MongoDB Server 6.0、7.0、8.0**。

---

## 二、版本对应关系汇总

| Mongoose 版本 | MongoDB Node.js 驱动版本 | 支持的 MongoDB Server | 最低 Node.js |
|---------------|-------------------------|----------------------|-------------|
| **Mongoose 9.x** | `mongodb` ~7.2 | **6.0 - 8.0** | **≥ 18.18.0** |
| Mongoose 8.x | `mongodb` ~6.20.0 | 4.4 - 8.0 | ≥ 16.20.1 |
| Mongoose 7.x | `mongodb` ~5.x | 4.4 - 7.0 | ≥ 14.0.0 |
| Mongoose 6.x | `mongodb` ~4.x | 4.0 - 6.0 | ≥ 12.0.0 |

---

## 三、9.x 与 8.x 的关键差异（Breaking Changes）

根据 [GitHub Release 9.0.0](https://github.com/Automattic/mongoose/releases/tag/9.0.0)：

| 变更项 | 说明 |
|--------|------|
| **MongoDB Driver 升级** | 从 driver v6 升级至 **v7** |
| **移除回调式 pre 中间件** | 不再支持 `next()` 回调形式的 `pre()` hooks |
| **UUID 类型变更** | `Schema.Types.UUID` 现在返回 BSON UUID 对象，而非字符串 |
| **查询空值行为变更** | `findOne(null)`、`find(null)` 等现在会**抛出错误**，而非返回第一个文档 |
| **Update Pipeline 默认禁用** | 默认禁止 update pipelines，需显式设置 `updatePipeline` 选项 |
| **异步化验证器** | `update validators`、`doValidate()`、`save hooks` 改为异步 |
| **移除 bson 直接依赖** | 不再直接依赖 `bson` 包，改用 `mongodb/lib/bson` |
| **移除浏览器构建** | 浏览器构建移至 `@mongoosejs/browser` 包 |
| **TypeScript 类型收紧** | `create()` / `insertOne()` 参数更严格；`FilterQuery` 属性不再解析为 `any` |

---

## 四、可执行建议

| 场景 | 建议 |
|------|------|
| **新项目** | MongoDB Server **7.0 或 8.0** + Mongoose 9.x + Node.js ≥ **18.18.0** |
| **从 8.x 升级** | 先检查上述 Breaking Changes，特别是回调式中间件和 TypeScript 类型变更 |
| **MongoDB 版本** | 确保 MongoDB Server ≥ **6.0**，旧版本不再受 9.x 支持 |
| **Node.js 环境** | 确保 Node.js ≥ **18.18.0**，推荐 18 LTS / 20 LTS |

---

## 五、参考来源

1. [Mongoose 9.0.0 Release Notes](https://github.com/Automattic/mongoose/releases/tag/9.0.0)
2. [Mongoose 兼容性文档](https://mongoosejs.com/docs/compatibility.html)
3. [Mongoose 迁移到 9.x 指南](https://mongoosejs.com/docs/migrating_to_9.html)
4. [Mongoose GitHub 仓库](https://github.com/Automattic/mongoose)
