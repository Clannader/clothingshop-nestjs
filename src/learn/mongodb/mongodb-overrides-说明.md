# package.json 中 overrides 字段说明

> 生成时间：2026-11-12 ｜ 关联修复：`start:dev` TS2322 编译报错（mongoose / mongodb 双版本冲突）

## 一句话总结

**强制让 mongoose 内部使用的 mongodb 版本，跟本项目直接声明的 mongodb 版本保持完全一致**，从而消除项目里"两份 mongodb"导致的 TypeScript 类型冲突。

## 配置内容（package.json）

```json
"overrides": {
  "mongoose": {
    "mongodb": "$mongodb"
  }
}
```

## 逐行拆解

| 层级 | 含义 |
|------|------|
| `overrides`（顶层 key） | npm ≥ 8.3 的"依赖版本强制覆盖"机制：改写**传递依赖**（依赖的依赖）实际解析到的版本 |
| `"mongoose"` | 覆盖目标：名为 mongoose 的这个包的依赖树 |
| `"mongodb": "$mongodb"` | 把 mongoose 内部的 mongodb 依赖，强制解析为 `$mongodb` 指向的版本 |
| `$mongodb`（特殊语法） | `$` 前缀 = **引用本项目 dependencies 里同名直接依赖的声明**，即 `"mongodb": "6.22.0"`。不写死版本号，以后顶层升级 mongodb 时 override 自动跟随，不用改两处 |

## 为什么这个项目需要它

npm 默认按 semver 解析依赖，而 mongoose 8.24.8 官方声明它需要 `mongodb ~6.20.0`（即 `>=6.20.0 <6.21.0`）：

```
本项目 dependencies:  mongodb 6.22.0
mongoose 想要的:      mongodb ~6.20.0   ← 与 6.22.0 无交集
```

`6.22.0` 不满足 `~6.20.0`，npm 不会把顶层那份复用给 mongoose，而是给它单独装一份旧的 6.20.0 到 `node_modules/mongoose/node_modules/mongodb`。于是磁盘上出现**两份 mongodb**，TypeScript 把两份里的 `MongoClient` 视为两个完全不同的类型（类里的私有属性 `driverInfoList` 各自声明，结构再像也不兼容），`src/single.app.ts:145` 把 mongoose 的连接传给 `SessionMongoStore`（`client?: MongoClient`，来自 connect-mongo 的类型定义）时就报了 TS2322。

加上这段 overrides 后，npm 强制 mongoose 的 mongodb 也解析到 6.22.0，全项目只剩一份，类型冲突根除。

## 本次修复的验证结果（2026-11-12）

- ✅ `npm install` 成功（added 1 package, removed 2 packages）
- ✅ `node_modules/mongoose/node_modules/mongodb` 嵌套目录消失，新 `package-lock.json` 中无嵌套 mongodb 条目
- ✅ 顶层 mongodb 保持 6.22.0、mongoose 保持 8.24.8（未降级）
- ✅ `npx tsc --noEmit -p tsconfig.json` 退出码 0，TS2322 编译错误消除

## 两点注意事项

1. **它绕过了 mongoose 官方兼容声明**：官方测试矩阵是 ~6.20.0，本配置让它运行在 6.22.0 上。mongodb driver 6.x 的 minor 版本间向后兼容（6.22 是 API 超集），运行时安全，但属于"脱离官方测试矩阵"的操作——如果未来 mongoose 升级后报 mongodb 相关的运行时异常，优先检查这个 override。
2. **它可能变成多余**：等 mongoose 官方声明的 mongodb 范围覆盖 6.22.0 时（比如升级 mongoose 新版本），这段配置可以删除，恢复官方兼容矩阵。

## 相关改动文件

| 文件 | 改动 |
|------|------|
| `package.json` | 新增 `overrides` 字段 |
| `package-lock.json` | 随 overrides 重新生成（无嵌套 mongodb 条目） |
