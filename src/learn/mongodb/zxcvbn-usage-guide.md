# zxcvbn 密码强度库 — 使用文档与参数说明

> **版本**：涵盖 zxcvbn-ts（TypeScript 推荐版）、原版 zxcvbn（Dropbox JS 版）、Python 版、Java 版  
> **适用场景**：密码输入框实时强度检测、注册/修改密码安全校验、密码策略制定

---

## 目录

1. [简介](#一简介)
2. [安装方法](#二各语言版本安装方法)
3. [核心 API 与参数](#三核心-api-和参数说明)
4. [使用示例](#四使用示例代码)
5. [返回结果详解](#五返回结果字段详解)
6. [性能与安全建议](#六性能与安全建议)

---

## 一、简介

**zxcvbn** 是 Dropbox 开源的密码强度估算器，灵感来自真实密码破解器的攻击逻辑。它通过**模式匹配**和**保守估计**分析密码的实际安全性，而非依赖简单的规则（如"必须包含大小写+数字+符号"）。

### 核心能力

| 能力 | 说明 |
|------|------|
| 常见密码识别 | 内置 4 万+ 常见密码字典 |
| 个人信息过滤 | 识别常见姓名、维基百科热词、各国常用词汇 |
| 模式检测 | 日期、重复字符（`aaa`）、序列（`abcd`）、键盘布局（`qwerty`）、l33t 语言 |
| 即时反馈 | 提供针对性的文字反馈，引导用户设置更安全的密码 |
| 多语言支持 | 反馈和字典支持国际化（zxcvbn-ts 版本） |

### 为什么用它替代传统密码规则？

- **更安全**：规则常常双向失败——允许 `P@ssword1`（看似合规实则很弱），又拒绝真正的强密码
- **更灵活**：支持口令短语（passphrase）、键盘模式、不可预测的大小写变化
- **更易用**：无规则界面，即时反馈，无需用户记忆复杂规则

---

## 二、各语言版本安装方法

### 1. JavaScript / TypeScript（推荐：zxcvbn-ts）

```bash
npm install @zxcvbn-ts/core @zxcvbn-ts/language-common @zxcvbn-ts/language-en
```

**说明**：

- `@zxcvbn-ts/core`：核心库
- `@zxcvbn-ts/language-common`：通用字典 + 键盘布局
- `@zxcvbn-ts/language-en`：英语字典 + 英语反馈翻译

> zxcvbn-ts 是完整 TypeScript 重写版，维护更活跃，支持模块化加载、更小的打包体积、自定义匹配器、异步匹配器、haveibeenpwned 匹配器等。

**原版 JavaScript（Dropbox 版）**：

```bash
npm install zxcvbn
```

### 2. Python

```bash
pip install zxcvbn
```

> 对应仓库：[dwolfhub/zxcvbn-python](https://github.com/dwolfhub/zxcvbn-python)

### 3. Java（zxcvbn4j）

**Maven**：

```xml
<dependency>
    <groupId>com.nulab-inc</groupId>
    <artifactId>zxcvbn</artifactId>
    <version>1.x.x</version>
</dependency>
```

> 对应仓库：[nulab/zxcvbn4j](https://github.com/nulab/zxcvbn4j)

### 4. 其他语言实现

| 语言 | 仓库 |
|------|------|
| C/C++ | zxcvbn-c / zxcvbn-cpp |
| Rust | zxcvbn-rs |
| Go | zxcvbn-go |
| Ruby | zxcvbn-ruby |
| PHP | zxcvbn-php |
| C#/.NET | zxcvbn-cs |

---

## 三、核心 API 和参数说明

### 3.1 zxcvbn-ts（推荐）

#### 基本用法

```javascript
import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
}

const zxcvbn = new ZxcvbnFactory(options)

// 同步检查
const result = zxcvbn.check(password)

// 异步检查（用于 API 类自定义匹配器）
const result = await zxcvbn.checkAsync(password)
```

#### ZxcvbnFactory 构造函数参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dictionary` | Object | `{}` | 用于密码比较的词典（常见词汇/姓名等）。推荐至少使用 `common` + `en` 语言包 |
| `graphs` | Object | `{}` | 键盘布局，用于检测键盘模式。支持 `qwerty`、`qwertz`、`azerty`、`dvorak`、`keypads` |
| `l33tTable` | Object | 内置 | l33t 替换表（如 `a` → `4`/`@`）。通常无需调整 |
| `translations` | Object | 键值 | 反馈翻译。默认返回翻译键，使用语言包后可获得真实翻译文本 |
| `useLevenshteinDistance` | boolean | `false` | 是否启用 Levenshtein 距离检查（会牺牲性能，建议配合 debounce 使用） |
| `levenshteinThreshold` | number | `2` | Levenshtein 检查阈值 |
| `l33tMaxSubstitutions` | number | `100` | l33t 匹配器最大替换次数上限（防止 DOS 攻击） |
| `maxLength` | number | `256` | 检查的最大密码长度，超过部分视为强密码 |
| `timeEstimationValues` | Object | 内置 | 评分和攻击时间计算阈值。**不建议修改**，除非你知道自己在做什么 |

**自定义匹配器**（第二个参数）：

```javascript
const zxcvbn = new ZxcvbnFactory(options, [customMatcher])
```

### 3.2 原版 zxcvbn（Dropbox 版）

```javascript
const result = zxcvbn(password, user_inputs)
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `password` | string | 是 | 要评估的密码 |
| `user_inputs` | string[] | 否 | 用户个人信息列表（用户名、邮箱、公司名等），避免将个人信息误判为强密码 |

### 3.3 Python 版

```python
from zxcvbn import zxcvbn

result = zxcvbn(password, user_inputs=[])
# user_inputs 为可选参数，用法同原版 JS
```

### 3.4 Java 版（zxcvbn4j）

```java
import com.nulabinc.zxcvbn.Zxcvbn;
import com.nulabinc.zxcvbn.Strength;

Zxcvbn zxcvbn = new Zxcvbn();
Strength strength = zxcvbn.measure(password, userInputs);
```

---

## 四、使用示例代码

### 4.1 zxcvbn-ts 完整示例

```javascript
import { ZxcvbnFactory } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
}

const zxcvbn = new ZxcvbnFactory(options)

// 检查密码
const result = zxcvbn.check('Tr0ub4dor&3')

console.log('Score:', result.score)
console.log('Guesses:', result.guesses)
console.log('Crack time:', result.crackTimesDisplay.offlineSlowHashingXPerSecond)
console.log('Feedback:', result.feedback)
```

### 4.2 原版 zxcvbn 示例

```javascript
const zxcvbn = require('zxcvbn')

const result = zxcvbn('Tr0ub4dor&3', ['oliver', 'oliver.wu@company.com'])

console.log(result.score)        // 0-4
console.log(result.guesses)      // 估计猜测次数
console.log(result.crack_times_display.offline_slow_hashing_1e4_per_second) // 破解时间
console.log(result.feedback)     // 改进建议
```

### 4.3 Python 示例

```python
from zxcvbn import zxcvbn

password = "Tr0ub4dor&3"
user_inputs = ["oliver", "oliver.wu@company.com"]

result = zxcvbn(password, user_inputs)

print(f"Score: {result['score']}")
print(f"Guesses: {result['guesses']}")
print(f"Warning: {result['feedback']['warning']}")
print(f"Suggestions: {result['feedback']['suggestions']}")
```

---

## 五、返回结果字段详解

### 5.1 核心字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `guesses` | number | 估计破解该密码所需的猜测次数 |
| `guessesLog10` | number | `guesses` 的以 10 为底的对数（数量级） |
| `score` | number (0-4) | 密码强度评分，用于实现强度条 |
| `crackTimes` | Object | 多种攻击场景下的破解时间估算（秒） |
| `feedback` | Object | 针对弱密码的改进反馈（`score <= 2` 时设置） |
| `sequence` | Array | zxcvbn 识别出的密码模式列表 |
| `calcTime` | number | 计算耗时（毫秒） |

### 5.2 `score` 评分规则

| 分值 | 含义 | 猜测次数阈值 | 安全描述 |
|------|------|-------------|----------|
| **0** | 太弱 | `guesses < 10³` | 极易被猜到，风险密码 |
| **1** | 很弱 | `guesses < 10⁶` | 可抵御限制频率的在线攻击 |
| **2** | 一般 | `guesses < 10⁸` | 可抵御不限制频率的在线攻击 |
| **3** | 较强 | `guesses < 10¹⁰` | 可抵御离线慢哈希场景（bcrypt/scrypt/PBKDF2） |
| **4** | 很强 | `guesses >= 10¹⁰` | 强力抵御离线慢哈希场景 |

> `timeEstimationValues` 选项可自定义这些阈值。

### 5.3 `crackTimes` 攻击场景

每个场景都包含 `seconds`（秒数）、`display`（友好显示，如 `"less than a second"`、`"3 hours"`、`"centuries"`）、`base`（基础数值）。

| 场景 | 说明 |
|------|------|
| `onlineThrottlingXPerHour` | 限制密码尝试频率的在线攻击（如每小时 X 次） |
| `onlineNoThrottlingXPerSecond` | 不限制频率或被绕过限制的在线攻击 |
| `offlineSlowHashingXPerSecond` | 离线攻击，使用慢哈希函数（bcrypt、scrypt、PBKDF2） |
| `offlineFastHashingXPerSecond` | 离线攻击，使用快哈希函数（SHA-1、SHA-256、MD5），估算约 100亿次/秒 |

### 5.4 `feedback` 反馈结构

```javascript
{
  warning: "这是前 10 位常见密码",  // 问题说明，有时为空字符串
  suggestions: [                     // 改进建议列表
    "Add another word or two",
    "Avoid sequences like abc"
  ]
}
```

### 5.5 `sequence` 模式列表

展示 zxcvbn 识别出的构成密码的各个模式片段，例如：

- `dictionary` - 字典匹配
- `spatial` - 键盘布局匹配
- `repeat` - 重复字符
- `sequence` - 序列字符
- `date` - 日期模式
- `bruteforce` - 暴力破解部分
- `regex` - 正则匹配
- `l33t` - l33t 替换

---

## 六、性能与安全建议

| 项目 | 说明 |
|------|------|
| 计算速度 | 25 字符密码约 5-20ms（现代浏览器/CPU），100 字符约 100ms |
| 长度限制 | 默认最多检查 256 字符，超出部分视为强密码。可通过 `maxLength` 调整 |
| 防抖建议 | 对于实时输入检查，建议使用 debounce；启用 Levenshtein 距离时尤其需要 |
| 输入截断 | 为控制延迟，可只传用户输入的前 100 个字符给 zxcvbn |
| 自定义输入 | 始终将用户名、邮箱、公司名等传入 `user_inputs`（或 zxcvbn-ts 的自定义字典），防止个人信息被当作强密码 |

---

## 参考来源

- [Dropbox zxcvbn 原版 GitHub](https://github.com/dropbox/zxcvbn)
- [zxcvbn-ts 官方文档](https://zxcvbn-ts.github.io/zxcvbn/)
- [zxcvbn-ts GitHub 仓库](https://github.com/zxcvbn-ts/zxcvbn)
- [zxcvbn-python GitHub](https://github.com/dwolfhub/zxcvbn-python)
- [zxcvbn4j (Java) GitHub](https://github.com/nulab/zxcvbn4j)

---

> 文档生成时间：2026-07-02  
> 如需针对特定语言版本（如 Rust/Go 版）的文档，或者想了解如何编写自定义匹配器，可进一步补充。
