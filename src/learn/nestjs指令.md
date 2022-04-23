####快速生成文件指令
```bash
nest g resource [name]
```
####每日学习笔记
```bash
2022-04-19
    如果controller里面的返回值不适应express的res对象,那么它将自动序列化为JSON.
但是,当它返回一个JavaScript基本类型（例如string、number、boolean）时, 
Nest将只发送值,而不尝试序列化它.这使响应处理变得简单:只需要返回值,其余的由Nest负责
    如果使用@Res来返回值,那么就能使用由该响应对象暴露的原生响应处理函数。
例如，使用 Express，您可以使用 response.status(200).send() 构建响应
    注意！Nest 检测处理程序何时使用 @Res() 或 @Next()，表明你选择了特定于库的选项。
如果在一个处理函数上同时使用了这两个方法，那么此处的标准方式就是自动禁用此路由, 
你将不会得到你想要的结果。如果需要在某个处理函数上同时使用这两种方法（
例如，通过注入响应对象，单独设置 cookie / header，但把其余部分留给框架），
你必须在装饰器 @Res({ passthrough: true }) 中将 passthrough 选项设为 true
```
####异步代码
```bash
@Get()
async findAll(): Promise<any[]> {
  return [];
}

@Get()
findAll(): Observable<any[]> {
  return of([]);
}
上述的两种方法都是可行的，你可以选择你喜欢的方式
```
