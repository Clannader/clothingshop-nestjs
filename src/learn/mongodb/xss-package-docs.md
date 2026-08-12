# xss 模块包使用文档

> **当前最新版本**：`1.0.15`
> **GitHub**：https://github.com/leizongmin/js-xss
> **许可证**：MIT

---

## 1. 安装

```bash
npm install xss
```

TypeScript 用户无需额外安装 `@types/xss`，包自带类型定义。

---

## 2. 基本用法

### 2.1 快速过滤

```typescript
import xss from 'xss';

const dirty = '<script>alert("xss")</script><p>Hello</p>';
const clean = xss(dirty);
// 输出: '&lt;script&gt;alert("xss");&lt;/script&gt;<p>Hello</p>'
```

### 2.2 传入自定义选项

```typescript
const clean = xss(dirty, { whiteList: { p: [] } });
// 只允许 <p> 标签，其余全部转义
```

### 2.3 创建 FilterXSS 实例（避免每次传 options）

```typescript
import { FilterXSS } from 'xss';

const myXss = new FilterXSS({
  whiteList: { a: ['href', 'title'] },
});

const clean = myXss.process(dirty);
```

### 2.4 获取过滤结果 + 被移除的标签/属性列表

```typescript
import { filterXSSWithResult } from 'xss';

const result = filterXSSWithResult(
  '<script>alert("xss")</script><a href="#" onclick="evil()">click</a>'
);

console.log(result.html);
// '&lt;script&gt;alert("xss");&lt;/script&gt;<a href="#">click</a>'

console.log(result.removed);
// [
//   { type: "tag", tag: "script", html: "<script>", isClosing: false },
//   { type: "tag", tag: "script", html: "</script>", isClosing: true },
//   { type: "attr", tag: "a", attr: "onclick", value: "evil()" }
// ]
```

---

## 3. 完整配置选项（IFilterXSSOptions）

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `whiteList` / `allowList` | `IWhiteList` | 内置白名单 | 允许的标签及其属性 |
| `onTag` | `OnTagHandler` | 无操作 | 白名单内标签的回调 |
| `onTagAttr` | `OnTagAttrHandler` | 无操作 | 白名单内属性的回调 |
| `onIgnoreTag` | `OnTagHandler` | 转义处理 | 白名单外标签的回调 |
| `onIgnoreTagAttr` | `OnTagAttrHandler` | 移除属性 | 白名单外属性的回调 |
| `safeAttrValue` | `SafeAttrValueHandler` | 内置函数 | 属性值安全过滤 |
| `escapeHtml` | `EscapeHandler` | `<` → `&lt;`，`>` → `&gt;` | HTML 转义函数 |
| `stripIgnoreTag` | `boolean` | `false` | 是否直接移除白名单外标签（保留内容） |
| `stripIgnoreTagBody` | `boolean \| string[]` | `false` | 是否移除白名单外标签及其内容 |
| `allowCommentTag` | `boolean` | `false` | 是否保留 HTML 注释 |
| `stripBlankChar` | `boolean` | `false` | 是否移除不可见字符 |
| `singleQuotedAttributeValue` | `boolean` | `false` | 属性值用单引号包裹 |
| `css` | `object \| boolean` | 内置 CSS 过滤器 | `style` 属性的 CSS 过滤配置，`false` 不过滤 |

---

## 4. 默认白名单

```typescript
import { getDefaultWhiteList } from 'xss';

// 默认允许的标签和属性：
{
  a:          ['target', 'href', 'title'],
  abbr:       ['title'],
  address:    [],
  area:       ['shape', 'coords', 'href', 'alt'],
  article:    [],
  aside:      [],
  audio:      ['autoplay', 'controls', 'crossorigin', 'loop', 'muted', 'preload', 'src'],
  b:          [],
  bdi:        ['dir'],
  bdo:        ['dir'],
  big:        [],
  blockquote: ['cite'],
  br:         [],
  caption:    [],
  center:     [],
  cite:       [],
  code:       [],
  col:        ['align', 'valign', 'span', 'width'],
  colgroup:   ['align', 'valign', 'span', 'width'],
  dd:         [],
  del:        ['datetime'],
  details:    ['open'],
  div:        [],
  dl:         [],
  dt:         [],
  em:         [],
  figcaption: [],
  figure:     [],
  font:       ['color', 'size', 'face'],
  footer:     [],
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
  header:     [],
  hr:         [],
  i:          [],
  img:        ['src', 'alt', 'title', 'width', 'height', 'loading'],
  ins:        ['datetime'],
  kbd:        [],
  li:         [],
  mark:       [],
  nav:        [],
  ol:         [],
  p:          [],
  pre:        [],
  s:          [],
  section:    [],
  small:      [],
  span:       [],
  sub:        [],
  summary:    [],
  sup:        [],
  strong:     [],
  strike:     [],
  table:      ['width', 'border', 'align', 'valign'],
  tbody:      ['align', 'valign'],
  td:         ['width', 'rowspan', 'colspan', 'align', 'valign'],
  tfoot:      ['align', 'valign'],
  th:         ['width', 'rowspan', 'colspan', 'align', 'valign'],
  thead:      ['align', 'valign'],
  tr:         ['rowspan', 'align', 'valign'],
  tt:         [],
  u:          [],
  ul:         [],
  video:      ['autoplay', 'controls', 'crossorigin', 'loop', 'muted', 'playsinline', 'poster', 'preload', 'src', 'height', 'width'],
}
```

> ⚠️ **注意**：默认白名单**不包含** `<script>`、`<iframe>`、`<style>`、`<form>`、`<input>` 等危险标签。

---

## 5. 各选项详解与示例

### 5.1 `whiteList` / `allowList` — 白名单

```typescript
// 方式一：覆盖全部白名单
const clean = xss(dirty, {
  whiteList: {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt'],
    p: [],
  },
  // 其他标签全部被过滤
});

// 方式二：在默认白名单基础上扩展（推荐）
import { getDefaultWhiteList } from 'xss';

const whiteList = getDefaultWhiteList();
// 扩展：给 img 加 loading 属性
whiteList.img = [...(whiteList.img || []), 'loading'];
// 扩展：允许 iframe 标签（谨慎！）
whiteList.iframe = ['src', 'width', 'height', 'frameborder'];

const myXss = new FilterXSS({ whiteList });
```

> `allowList` 与 `whiteList` 功能完全一致，只是别名。

### 5.2 `onTag` — 白名单内标签的回调

```typescript
// 签名：(tag: string, html: string, options: { sourcePosition, position, isClosing, isWhite }) => string | void

const clean = xss(dirty, {
  onTag(tag, html, options) {
    if (tag === 'a' && options.isWhite) {
      // 返回字符串 → 替换整个标签
      // 不返回 → 按默认逻辑处理
    }
  },
});
```

### 5.3 `onTagAttr` — 白名单内属性的回调

```typescript
// 签名：(tag: string, name: string, value: string, isWhiteAttr: boolean) => string | void

const clean = xss(dirty, {
  onTagAttr(tag, name, value, isWhiteAttr) {
    if (tag === 'img' && name === 'src') {
      // 返回字符串 → 替换该属性
      // 不返回 → 按默认 safeAttrValue 处理
    }
  },
});
```

### 5.4 `onIgnoreTag` — 白名单外标签的回调

```typescript
// 签名同 onTag
// 默认行为：用 escapeHtml 转义（如 <script> → &lt;script&gt;）

const clean = xss(dirty, {
  onIgnoreTag(tag, html, options) {
    if (tag === 'x-custom') {
      return html; // 允许 <x-custom> 标签原样通过
    }
    // 不返回 → 按默认逻辑转义
  },
});
```

**实用示例：允许 `x-` 开头的自定义标签**

```typescript
const clean = xss(dirty, {
  onIgnoreTag(tag, html) {
    if (tag.startsWith('x-')) return html;
  },
});
```

### 5.5 `onIgnoreTagAttr` — 白名单外属性的回调

```typescript
// 签名同 onTagAttr
// 默认行为：移除该属性

const clean = xss(dirty, {
  onIgnoreTagAttr(tag, name, value, isWhiteAttr) {
    // 允许所有 data-* 属性
    if (name.startsWith('data-')) {
      return `${name}="${xss.escapeAttrValue(value)}"`;
    }
    // 不返回 → 默认移除
  },
});
```

### 5.6 `safeAttrValue` — 属性值安全过滤

```typescript
// 签名：(tag: string, name: string, value: string, cssFilter: ICSSFilter) => string

// 默认行为：
// - href/src：只允许 http:// https:// mailto: tel: data:image/ ftp:// ./ ../ # / 开头的值，其余返回空字符串
// - style：过滤 expression()、url(javascript:)，并通过 cssFilter 处理
// - background：过滤 javascript: 协议
// - 其他属性：转义 < > " 后返回

// 自定义示例：限制 a 标签 href 只允许本站链接
const clean = xss(dirty, {
  safeAttrValue(tag, name, value, cssFilter) {
    if (tag === 'a' && name === 'href') {
      if (!value.startsWith('/') && !value.startsWith('https://mysite.com')) {
        return ''; // 非本站链接清空
      }
    }
    return xss.safeAttrValue(tag, name, value, cssFilter); // 其余走默认
  },
});
```

### 5.7 `escapeHtml` — 自定义 HTML 转义函数

```typescript
// 默认实现：
function escapeHtml(html: string): string {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 一般不需要修改，除非有特殊需求
```

### 5.8 `stripIgnoreTag` — 直接移除白名单外标签

```typescript
// 默认 false：白名单外标签被转义（如 <script> → &lt;script&gt;）
// 设为 true：白名单外标签直接删除，但保留标签内的文本

const clean = xss('<script>alert("xss")</script>Hello', {
  stripIgnoreTag: true,
});
// 输出: 'alert("xss")Hello'  ← script 标签移除，内容保留
```

### 5.9 `stripIgnoreTagBody` — 移除白名单外标签及其内容

```typescript
// false / null / undefined：不移除（默认）
// true / '*'：移除所有白名单外标签及其内容
// ['script', 'style']：只移除指定标签及其内容

const clean = xss('<script>alert("xss")</script>Hello', {
  stripIgnoreTagBody: ['script'],
});
// 输出: 'Hello'  ← script 标签及其内容全部移除
```

### 5.10 `allowCommentTag` — 保留 HTML 注释

```typescript
// 默认 false：过滤 HTML 注释
// 设为 true：保留 <!-- comment -->

const clean = xss('<!-- hello -->World', {
  allowCommentTag: true,
});
// 输出: '<!-- hello -->World'
```

### 5.11 `stripBlankChar` — 移除不可见字符

```typescript
// 默认 false
// 设为 true：移除 ASCII 0-31 的控制字符（保留 \n \r）

const clean = xss(dirty, { stripBlankChar: true });
```

### 5.12 `css` — CSS 过滤配置

```typescript
// 默认：使用 cssfilter 模块过滤 style 属性中的危险 CSS
// 设为 false：不过滤 style 属性（危险！）
// 设为对象：自定义 cssfilter 的白名单

const myXss = new FilterXSS({
  css: {
    whiteList: {
      position: /^fixed|relative$/,  // 正则匹配
      top: true,                      // true = 允许任意值
      left: true,
      color: true,
    },
  },
});
```

### 5.13 `singleQuotedAttributeValue` — 属性值用单引号

```typescript
const clean = xss('<a href="#">link</a>', {
  singleQuotedAttributeValue: true,
});
// 输出: "<a href='#'>link</a>"
```

---

## 6. 导出的工具函数

```typescript
import xss, {
  // 核心类和函数
  FilterXSS,              // 过滤器类，new FilterXSS(options).process(html)
  filterXSS,              // 等同于默认导出的 xss 函数
  filterXSSWithResult,    // 返回 { html, removed }

  // 白名单
  whiteList,              // 默认白名单对象
  getDefaultWhiteList,    // 获取默认白名单的函数（返回新对象）

  // 处理函数
  onIgnoreTagStripAll,    // 直接返回空字符串的 onIgnoreTag

  // 转义工具
  escapeHtml,             // HTML 转义：< > → &lt; &gt;
  escapeQuote,            // 双引号转义：" → &quot;
  unescapeQuote,          // 反转义：&quot; → "
  escapeHtmlEntities,     // HTML 实体转义
  escapeDangerHtml5Entities, // HTML5 危险实体转义
  clearNonPrintableCharacter, // 清除不可打印字符
  friendlyAttrValue,      // 友好属性值（解码后可读）
  escapeAttrValue,        // 属性值转义

  // CSS
  cssFilter,              // 默认 CSS 过滤器实例
  getDefaultCSSWhiteList, // 获取默认 CSS 白名单

  // 辅助
  StripTagBody,           // 移除标签体的工具
  stripCommentTag,        // 移除 HTML 注释
  stripBlankChar,         // 移除不可见字符
  attributeWrapSign,      // 属性值包裹符号（默认 '"'）
} from 'xss';
```

---

## 7. 允许 `data-*` 属性

```typescript
import xss from 'xss';

const clean = xss('<div data-id="123" data-name="test">Hello</div>', {
  onIgnoreTagAttr(tag, name, value) {
    if (name.startsWith('data-')) {
      return `${name}="${xss.escapeAttrValue(value)}"`;
    }
  },
});
// 输出: '<div data-id="123" data-name="test">Hello</div>'
```

### 7.2 只保留纯文本（过滤所有 HTML）

```typescript
const clean = xss('<strong>hello</strong><script>alert(/xss/);</script>end', {
  whiteList: {},             // 空白名单
  stripIgnoreTag: true,      // 移除所有标签（保留文本）
  stripIgnoreTagBody: ['script'], // script 标签体也移除
});
// 输出: 'helloend'
```

### 7.3 在默认白名单基础上扩展标签和属性

```typescript
import { FilterXSS, getDefaultWhiteList } from 'xss';

const whiteList = getDefaultWhiteList();

// 添加 iframe 标签
whiteList.iframe = ['src', 'width', 'height', 'frameborder', 'allowfullscreen'];
// 给 div 加 style
whiteList.div = [...(whiteList.div || []), 'style', 'class'];
// 给所有标签加 class 和 id
for (const tag of Object.keys(whiteList)) {
  whiteList[tag] = [...(whiteList[tag] || []), 'class', 'id'];
}

const myXss = new FilterXSS({ whiteList });
```

### 7.4 限制 `<a>` 标签的 href 只允许安全协议

```typescript
import xss from 'xss';

const clean = xss(dirty, {
  safeAttrValue(tag, name, value, cssFilter) {
    if (tag === 'a' && name === 'href') {
      const v = value.trim().toLowerCase();
      if (
        !v.startsWith('http://') &&
        !v.startsWith('https://') &&
        !v.startsWith('mailto:') &&
        !v.startsWith('/') &&
        !v.startsWith('#')
      ) {
        return ''; // 阻止 javascript: 等危险协议
      }
    }
    return xss.safeAttrValue(tag, name, value, cssFilter);
  },
});
```

---

## 8. 与 Express 集成

### 8.1 全局中间件（Body 过滤）

```typescript
import xss from 'xss';
import express from 'express';

const app = express();

function sanitizeXss(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return xss(obj);
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeXss(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      const cleanKey = xss(key);
      sanitized[cleanKey] = sanitizeXss(obj[key]);
    }
    return sanitized;
  }

  return obj;
}

app.use(express.json());
app.use((req, _res, next) => {
  req.body = sanitizeXss(req.body);
  // Express 5 中 req.query 是只读 getter，不能用 req.query = ...
  // 解决方案：用自定义 query parser（见下方）
  next();
});
```

### 8.2 Express 5 自定义 Query Parser（解决 req.query 只读问题）

```typescript
import xss from 'xss';
import qs from 'qs';

app.set('query parser', (str: string) => {
  const parsed = qs.parse(str, { depth: 10, arrayLimit: 100 });
  return sanitizeXss(parsed);
});
```

---

## 9. 与 NestJS 集成

### 9.1 全局 Pipe（推荐）

```typescript
// pipes/sanitize-xss.pipe.ts
import { PipeTransform, Injectable } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class SanitizeXssPipe implements PipeTransform {
  private xssInstance: xss.FilterXSS;

  constructor() {
    // 可自定义白名单
    this.xssInstance = new xss.FilterXSS({
      // whiteList: { ... },
    });
  }

  transform(value: any) {
    return this.sanitize(value);
  }

  private sanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return this.xssInstance.process(obj);
    if (typeof obj === 'number' || typeof obj === 'boolean') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        const cleanKey = this.xssInstance.process(key);
        sanitized[cleanKey] = this.sanitize(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }
}
```

```typescript
// main.ts
import { SanitizeXssPipe } from './pipes/sanitize-xss.pipe';

app.useGlobalPipes(
  new SanitizeXssPipe(),
  // 可配合 ValidationPipe 一起用
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
);
```

### 9.2 自定义 Query Parser（NestJS 底层也是 Express）

```typescript
// main.ts
import xss from 'xss';
import qs from 'qs';

const app = await NestFactory.create(AppModule);

// Express 5 自定义 query parser
app.set('query parser', (str: string) => {
  const parsed = qs.parse(str, { depth: 10, arrayLimit: 100 });
  return sanitizeXss(parsed); // 复用上面的 sanitizeXss 函数
});
```

### 9.3 仅在特定路由使用

```typescript
// 在 Controller 中手动调用
import xss from 'xss';

@Post()
create(@Body() dto: CreateUserDto) {
  dto.name = xss(dto.name);
  dto.content = xss(dto.content);
  return this.userService.create(dto);
}
```

---

## 10. 命令行工具

```bash
# 处理文件
npx xss -i input.html -o output.html

# 交互式测试
npx xss -t

# 查看帮助
npx xss -h
```

---

## 11. 速查表

| 场景 | 配置 |
|------|------|
| 默认过滤（最常用） | `xss(html)` |
| 只保留纯文本 | `{ whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script'] }` |
| 允许 data-* 属性 | `onIgnoreTagAttr` 中判断 `name.startsWith('data-')` |
| 允许自定义标签 | `onIgnoreTag` 中判断 `tag.startsWith('x-')` 并 return html |
| 扩展默认白名单 | `getDefaultWhiteList()` → 修改 → `new FilterXSS({ whiteList })` |
| 过滤 style 属性 | 配置 `css` 选项或使用默认 cssfilter |
| 不过滤 style | `css: false`（危险） |
| Express 5 + XSS | 自定义 query parser + body 中间件 |
| NestJS 集成 | 全局 SanitizeXssPipe + 自定义 query parser |
