# NestJS 指令与学习笔记

---

## 1. 快速生成文件指令

```bash
nest g resource [name]
```

---

## 2. 每日学习笔记

### 2.1 2022-04-19 — Controller 返回值与响应处理

> 如果 controller 里面的返回值不适应 express 的 `res` 对象，那么它将自动序列化为 JSON。但是，当它返回一个 JavaScript 基本类型（例如 `string`、`number`、`boolean`）时，Nest 将只发送值，而不尝试序列化它。这使响应处理变得简单：只需要返回值，其余的由 Nest 负责。

> 如果使用 `@Res` 来返回值，那么就能使用由该响应对象暴露的原生响应处理函数。例如，使用 Express，您可以使用 `response.status(200).send()` 构建响应。

> ⚠️ **注意！** Nest 检测处理程序何时使用 `@Res()` 或 `@Next()`，表明你选择了特定于库的选项。如果在一个处理函数上同时使用了这两个方法，那么此处的标准方式就是自动禁用此路由，你将不会得到你想要的结果。如果需要在某个处理函数上同时使用这两种方法（例如，通过注入响应对象，单独设置 cookie / header，但把其余部分留给框架），你必须在装饰器 `@Res({ passthrough: true })` 中将 `passthrough` 选项设为 `true`。

---

### 2.2 2022-06-01 — WebStorm 与 Eclipse 提交 Git 代码差异问题

关于 webstorm 和 eclipse 提交 github 项目时，合并代码发现差异不一致的问题。首先是当你修改一个文件一点内容时，使用 webstorm 和 eclipse 两种不同的编译器提交时，合并代码发现对比的差异不一致：

- 使用 **eclipse** 提交时，差异就是你修改的内容
- 使用 **webstorm** 提交时，显示的差异是整个文件

> 参考地址：https://blog.csdn.net/weixin_44000238/article/details/108399817

**查出原因：**

两种不同的编译器提交代码时的 commit 有区别，push 代码时没有区别。

- eclipse commit 代码时，如果 git 的 config 文件没有配置 `core.autocrlf` 会默认 `false`
- 本人猜测 webstorm 没有配置 `core.autocrlf` 时，默认了 `true`

这样就能解释为什么使用 eclipse 提交代码时，合并并没有显示那么多差异的原因。使用 webstorm 提交时，默认了 `true`，导致整个文件的换行符改变了，所以才会合并时显示整个文件都有了修改。

**解决方案：**

如果发现 webstorm 提交代码有问题时，配置以下命令即可解决：

```bash
git config --global core.autocrlf true
```

> 可能本地项目一开始就使用了 webstorm 提交代码，导致如果使用 eclipse 提交时也没有去修改换行符，所以估计这种情况的提交代码是没有区别的。如果一开始使用了 eclipse 提交代码，可能就有区别了。

**关于 GitHub 提交 PR 的问题：**

发现如果提交了 PR，似乎是删除不了的，除非删除分支，要不然暂时找不到什么办法删除 PR，所以没什么事情就不要乱测 PR 了。

**关于 lint 格式化换行符：**

由于代码中使用了 lint 去格式化代码，所以所有的 ts 文件都是以 LF 作为换行符，就算新建的时候是 CRLF，lint 之后会自动变成 LF，所以不用理会这个了。只有 Windows 才会使用 CRLF，其他操作系统都是使用 LF 了，可以忽略这个问题。

> 如果出现提交代码时发现只修改一处地方，但是出现整个文件的差异时，就检查文件的换行符即可，还有 git 的 core 配置即可。因为要考虑代码的跨平台操作，换行符都是需要统一的。

---

## 3. 异步代码

```typescript
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

```typescript
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
```

> 上述的两种方法都是可行的，你可以选择你喜欢的方式。

---

## 4. 每日坑爹一记 — NestJS 配置文件踩坑

### 4.1 NestJS 无法使用 .js 后缀的配置文件

最近修改 nestjs 的配置，发现 nestjs 根本无法使用 `.js` 后缀的文件配置，因为底层代码是读取文件的内容然后 `JSON.parse()`，并不是 `require()` 文件内容出来的。

所以只能改回 `.json` 文件，这样就会导致一个问题：

- **多环境配置问题**：无法在一个文件里面直接配置多个不同的变量值
- **无法继承**：无法使用 `extends` 来继承文件的内容

> 解决方案：只能每个环境的配置都新建一个 `.json` 文件来使用 `-c` 命令指定使用哪个配置文件。

---

### 4.2 tsconfig.json 同样只能使用 .json

`tsconfig.json` 文件也是和 nestjs 一样，无法配置 `.js` 后缀的配置文件，还是只能使用 `.json`。

> ⚠️ `tsconfig.build.json` 这个文件是**必须要有**的文件，否则 jest 就无法启动，因为默认就是需要 `tsconfig.build.json` 文件来 build 的，但是实际上感觉项目可以指定使用 `tsconfig.json`。

---

### 4.3 Webpack 打包配置文件无效

Webpack 打包的文件，虽然可以配置 `.js` 后缀的文件，但是里面的内容值除了判断环境 `env` 那个值有效外，其他使用 js 导入的包均无效果。

> 目前发现只能使用写死的变量值才能有效，否则都是无效的配置，还是会使用 nest/cli 里面的默认配置项的，也是坑爹啊...
