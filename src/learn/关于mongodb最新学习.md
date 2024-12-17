1.使用mongotop
mongotop 5 --uri mongodb://root:admin@localhost:27017/admin // 每5s一次输出结果

2.使用mongostat
mongostat --username <username> --password <password> --authenticationDatabase <auth-db>
mongostat -n=20 5 -O=host,version --port 27017 --host localhost -u root -p admin --authenticationDatabase admin // 每5s一次,输出20次结束

3.统计输出每条大于多少kb的数据,每次执行需要重新打开mongodb shell,否则会报错,不懂为什么
const list = db.ifc_logs.find({})
let i = 0
list.forEach(doc => {
    const size = Object.bsonsize(doc)
    if (size > 100 * 1024) {
        i++
        print(doc.hotelid.toString() + '   '  + doc.trace_id.toString() +'  :  ' +size)
    }
})
print('总数:' + i)

4.查看mongodb的日志
getLog 是一条管理命令,可返回最近记录的 1024 个 mongod 事件.
getLog 无法从 mongod 日志文件中读取日志数据.相反,它会从记录的 mongod 事件的 RAM 缓存中读取数据.要运行 getLog,请使用 db.adminCommand() 方法.
db.adminCommand( { getLog:'global'} ).log.forEach(x => {print(x)})

5.按条件导出数据
文档  https://www.mongodb.com/zh-cn/docs/database-tools/mongoexport/
mongoexport -h localhost:27017 -u root -p admin -d admin -c logs --queryFile=~\\query.txt -o ~\\logs.json
条件内容使用JSON.stringify()格式化存到queryFile即可
queryFile内容{"date":{"$gte":{"$date":"2024-11-19T00:00:00.000Z"},"$lte":{"$date":"2024-11-21T00:00:00.000Z"}}}

6.导入数据
mongoimport -h localhost:27017 -u root -p admin -d admin -c logs --file ~\\logs.json
mongoimport -h localhost:27017 -u root -p admin -d admin -c logs --ssl --sslCAFile=~\xx.pem --file ~\\logs.json

疑问1：如果存在重复导入会如何：返回提示 7957 document(s) imported successfully. 10424 document(s) failed to import.
所以可以忽略的尽情导入

7.关于mongodb.log
mongodb4.2版本和7.0版本还是不一样的,发现一个问题,就是代码中计算的执行时间和mongodb计算的是有点差别的,mongodb确实是语句实际执行的时间
但服务器里面的执行时间其实还包含了主进程的等待时间,如果没有空闲的进程去处理,那么会进行等待,直到给mongodb发送执行命令,mongodb才能去执行
所以服务器计算的时间永远都是 >(大于) mongodb计算的时间.
4.2的日志很直观的看到执行语句,7.0的需要搜索"c": "COMMAND"
参考地址
7.0  https://www.mongodb.com/zh-cn/docs/v7.0/reference/log-messages/#std-label-log-message-pretty-printing
4.2  版本已经不更新,只能下载 https://www.mongodb.com/zh-cn/docs/legacy/?site=docs

8.jqlang的使用
-c 就是输出的时候json是一行,不格式化
-r 就是格式化JSON
-f 是输入条件的文件路径,内容为select(.attr.durationMillis>=200 and .c=="COMMAND")
查找耗时大于200ms,命令为COMMAND,ns包含clothingshop,条件后面加?是因为有些日志没有attr.ns字段会报错
select(.attr.durationMillis>=200 and .c=="COMMAND" and (.attr.ns | test("clothingshop.*")?))
> [out file path], > 后面跟着输出文件路径或者文件名
jq -f D:\\MongoDB\\Server\\jsonQuery.txt -c D:\MongoDB\Server\7.0\log\mongod.log > queryResult.json
所有输出基本都是默认格式化的,所以不需要加-r,只有不想格式化才加入-c

坑:
1.如果带上了-c,那么-r就会无效化
2.一般使用相对路径,例如:jq -f jsonQuery.txt jsonData.json > queryResult.json(如何不格式化加入-c,格式化就不加)
3.如果想遍历输出json中的数组: jq .rows[] jsonData.json
遍历输出数组中某个字段值: jq .rows[] | .fields jsonData.json
遍历输出数组增加判断条件: jq .rows[] | select(.fields=="value") jsonData.json
如果还想在上面的基础上仅返回某个字段: jq .rows[] | select(.fields=="value") | .fields jsonData.json
如果返回的字段包含双引号,可通过加入-r去掉: jq .rows[] | select(.fields=="value") | .fields jsonData.json -r
格式化当前json文件: jq . fileName.json > openResult.json
筛选多个字段返回: select(.fields=="value") | {hotel, date, text}

使用cmd输入命令时，"(冒号)需要转义
jq "select(.\"attr\".\"durationMillis\">=200 and .\"c\"==\"COMMAND\")" -c D:\MongoDB\Server\7.0\log\mongod.log > queryResult.json

9.关于mongodb7.0安装后没有db工具导出导出问题,是官网把这些工具整合到了database tools里面,只需要重新下载即可
下载地址 https://www.mongodb.com/try/download/database-tools

10.安装mongodb的服务
用管理员运行cmd运行这个语句创建服务
sc create MongoDB4.2 binPath="D:\MongoDB\Server\4.2\bin\mongod.exe --config "D:\MongoDB\Server\4.2\bin\mongod.cfg" --service" DisplayName="MongoDB4.2" start=auto
删除服务
sc delete MongoDB4.2

11.备份mongodb数据 
https://www.mongodb.com/zh-cn/docs/database-tools/mongodump/mongodump-examples/
// 全备份
mongodump -h localhost:27017 -d clothingshop -o D:\MongoDB\Server\dump
// 排除adminaccesses和adminlogs表,其他表备份,每次备份需要清空目录,否则会遗留上一次备份的数据
mongodump -h localhost:27017 -d clothingshop --excludeCollection=adminaccesses --excludeCollection=adminlogs -o D:\MongoDB\Server\dump
// 压缩备份
mongodump -h localhost:27017 -d clothingshop --archive=D:\MongoDB\Server\dump\clothingshop.20241122.gz --gzip

12.还原mongodb数据
https://www.mongodb.com/zh-cn/docs/database-tools/mongorestore/mongorestore-examples/
// 全还原
mongorestore -h localhost:27018 -d clothingshop D:\MongoDB\Server\dump\clothingshop
// 压缩还原
mongorestore -h localhost:27018 -d clothingshop --gzip --archive=D:\MongoDB\Server\dump\clothingshop.20241122.gz

13.重新配置mongodb,新增服务启动数据库
D:\MongoDB\Server\4.2\bin\mongod.exe --config "D:\MongoDB\Server\4.2\bin\mongod.cfg"
D:\MongoDB\Server\4.2\bin\mongod.exe --config "D:\MongoDB\Server\4.2\bin\mongod.cfg"  --install --serviceName "MongoDB4.2" --serviceDisplayName "MongoDB4.2"

14.关于索引优化
索引筛选器
https://www.mongodb.com/zh-cn/docs/manual/reference/command/nav-plan-cache/
索引分析
https://www.mongodb.com/zh-cn/docs/manual/reference/explain-results/#explain-output-structure
查询计划缓存
https://www.mongodb.com/zh-cn/docs/manual/reference/method/js-plan-cache/
mongo shell: JSON.stringify(db.orders.getPlanCache().list())

15.mongodb服务器cfg配置
参考地址: https://www.mongodb.com/zh-cn/docs/manual/reference/configuration-options
配置超过多少ms记录慢语句设置: operationProfiling.slowOpThresholdMs,默认100ms
例如:
operationProfiling:
  slowOpThresholdMs: 100

16.关于副本集搭建以及代码配置
下载多个mongodb实例安装:https://www.mongodb.com/try/download/community 下载zip绿色版
1.正常安装3个实例,端口分别为27017(设置为主节点),27018,27019为从节点
2.解压mongodb到指定文件夹,新增data和log文件夹,复制mongod.cfg,修改data和log路径,修改端口号
3.查看第10点,把mongodb加入服务测试
4.修改所有服务器的配置cfg(主节点+2台从节点)
replication:
  replSetName: "rs0" // 副本集名每一台都必须一样
修改配置后必须重启
5.通过mongosh进入主节点
https://www.mongodb.com/zh-cn/docs/mongodb-shell/#mongodb-binary-bin.mongosh
进入mongosh cmd运行 mongosh "mongodb://127.0.0.1:27017"
运行rs.initiate()
运行rs.add('127.0.0.1:27018') // 加入从节点
运行rs.add('127.0.0.1:27019') // 加入从节点
查看副本集配置rs.conf()

修改副本集的优先级,因为默认都是1,都是一样的,每一台都有可能成为主节点
修改第一台为主节点
```bash
cfg = rs.conf()
cfg.members[0].priority = 5
rs.reconfig(cfg)
```
注意使用工具连接需要勾上直连Direct Connection,否则会使用副本集连接
直连会出现: rs0 [direct: secondary] admin
直连副本集是只能只读,只有主节点的才能写

给副本集加入共享密码
https://www.mongodb.com/zh-cn/docs/manual/tutorial/enforce-keyfile-access-control-in-existing-replica-set/
security:
  keyFile: <path-to-keyfile>

<path-to-keyfile> 文件获取通过openssl
openssl rand -base64 756 > <path-to-keyfile>

关于强制更换主节点方法文档: https://www.mongodb.com/zh-cn/docs/manual/tutorial/force-member-to-be-primary/
连接主节点:运行:rs.stepDown()
const cfg = rs.conf()
cfg.members[0].priority = 0.5
cfg.members[1].priority = 0.5
cfg.members[2].priority = 1
rs.reconfig(cfg)

关于仲裁节点是因为资源问题,只有一个主和从,但是副本集要求一个主,2个从,这时候需要加入仲裁节点
https://www.mongodb.com/zh-cn/docs/manual/tutorial/add-replica-set-arbiter/

代码中配置的连接:mongodb://127.0.0.1:27017,127.0.0.1:27019,127.0.0.1:27020/dbName
测试总结,需要配置主和从的所有地址,如果主连接中断,则根据优先级从2个从节点中选择一个作为主节点连接
如果主节点恢复连接后,mongodb又会根据优先级把原本的主节点变回之前的那台服务器