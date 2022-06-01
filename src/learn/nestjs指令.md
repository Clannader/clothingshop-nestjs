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
2022-06-01
    关于webstorm和eclipse提交github项目时,合并代码发现差异不一致的问题.首先是当你修改一个文件
一点内容时,使用webstorm和eclipse两种不同的编译器提交时,合并代码发现对比的差异不一致,使用eclipse
提交时,差异就是你修改的内容,但是使用webstorm提交时,显示的差异是整个文件,具体看地址
https://blog.csdn.net/weixin_44000238/article/details/108399817
    查出原因是两种不同的编译器提交代码时的commit有区别,push代码时没有区别.eclipse commit代码时,
如果git的config文件没有配置core.autocrlf会默认false,本人猜测webstorm没有配置core.autocrlf时,默认了true
这样就能解释为什么使用eclipse提交代码时,合并并没有显示那么多差异的原因,使用webstorm提交时,默认了true,导致整个
文件的换行符改变了,所以才会合并时显示整个文件都有了修改
    如果发现webstorm提交代码有问题时,配置git config --global core.autocrlf true这个就可以解决了,可能本地项目
一开始就使用了webstorm提交代码,导致如果使用eclipse提交时也没有去修改换行符,所以估计这种情况的提交代码是没有区别的,如果
一开始使用了eclipse提交代码,可能就有区别了
    这里还关于github提交pr的问题,发现如果提交了pr,似乎是删除不了的,除非删除分支,要不然暂时找不到什么办法删除pr,所以
没什么事情就不要乱测pr了
    由于代码中使用了lint去格式化代码,所以所有的ts文件都是以LF作为换行符,就算新建的时候是CRLF,lint之后会自动变成LF,所以
不用理会这个了,只有Windows才会使用CRLF,其他操作系统都是使用LF了,所有可以忽略这个问题,如果出现提交代码时发现只修改一处地方
,但是出现整个文件的差异时,就检查文件的换行符即可,还有git的core配置即可.因为要考虑代码的跨平台操作,换行符都是需要统一的
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
