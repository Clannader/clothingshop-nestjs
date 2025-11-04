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

疑问1:如果存在重复导入会如何:返回提示 7957 document(s) imported successfully. 10424 document(s) failed to import.
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
修改json节点值,例如把a改成b: {b: .a} | del(.a), 如果key有特殊字符需要使用双引号: {message: ."@message"} | del(."@message")

使用cmd输入命令时,"(冒号)需要转义
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
  keyFile: path-to-keyfile.pem

path-to-keyfile.pem 文件获取通过openssl
openssl rand -base64 756 > path-to-keyfile.pem

关于强制更换主节点方法文档: https://www.mongodb.com/zh-cn/docs/manual/tutorial/force-member-to-be-primary/
连接主节点:运行:rs.stepDown()
再运行下面代码,切换第三台为主节点
```bash
const cfg = rs.conf()
cfg.members[0].priority = 1
cfg.members[1].priority = 1
cfg.members[2].priority = 5
rs.reconfig(cfg)
```

关于仲裁节点是因为资源问题,只有一个主和从,但是副本集要求一个主,2个从,这时候需要加入仲裁节点
https://www.mongodb.com/zh-cn/docs/manual/tutorial/add-replica-set-arbiter/
仲裁节点其实也是一个mongodb实例,但是不存储任何数据

代码中配置的连接:mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/dbName
测试总结,需要配置主和从的所有地址,如果主连接中断,则根据优先级从2个从节点中选择一个作为主节点连接
如果主节点恢复连接后,mongodb又会根据优先级把主节点变回之前的那台服务器

根据以上的测试,服务器主要读写主节点,写数据时主节点会往其中一个从节点发送数据,通过security.keyFile验证节点之间的安全校验
在从节点上写数据,然后其中一个从节点会往其他从节点发送数据写入,大概是这样.又或者是主节点分别往多个从节点写入数据.
从节点之间通过心跳互相判断是否变成主节点

17.关于数据库的切换方案
比如从数据库6.0切换到数据库7.0
可以使用副本集的方式同步数据后切换.
流程如下:
1)新增7.0数据库连接,从数据库6.0中加入数据库7.0的连接作为从节点,那么数据库7.0就会同步数据库6.0的数据
2)修改服务器数据库地址,新增数据库7.0地址到服务器连接
3)降低数据库6.0的主节点,把数据库7.0的某一台作为主节点
4)服务器删除数据库6.0的连接
5)删除数据库6.0的所有从节点,这样数据库就会切换完成,并且不会数据丢失

18.关于数据库的读写关注
读关注: https://www.mongodb.com/zh-cn/docs/manual/reference/read-concern/
db.restaurants.find( { _id: 5 } ).readConcern("linearizable").maxTimeMS(10000)
写关注: https://www.mongodb.com/zh-cn/docs/manual/core/replica-set-write-concern/
db.products.insertOne(
{ item: "envelopes", qty : 100, type: "Clasp" },
{ writeConcern: { w: "majority" , wtimeout: 5000 } }
)
读写关注是确认副本集每个节点确保数据一致性的,不同的设置确保的节点数据不一样
例如读关注,确保主节点或者全部/部分从节点有数据就返回,写关注也是一样,主节点写入就返回或者是全部/部分从节点写入成功才返回

19.关于数据库连接不写副本集名称的影响
如果连接地址中没有指定副本集名称,MongoDB客户端可能无法识别这是一个副本集连接,从而可能只连接到单个节点(通常是Primary节点),而无法享受到副本集提供的高可用性和数据冗余‌
在某些情况下,不写副本集名称可能导致连接失败或不稳定,因为客户端可能无法正确处理副本集中的节点变更(如Primary节点选举、节点故障等)

20.mongoDB连接指南
https://www.mongodb.com/zh-cn/docs/drivers/php/laravel-mongodb/v5.x/fundamentals/connection/connect-to-mongodb/
直连参数?directConnection=true
副本集参数?replicaSet=rs0
读偏好参数?readPreference=secondary

21.mongodb连接地址的readPreference如何理解
测试这个只读结果可以开启monitorCommands=true,可以查看每条语句执行时使用的address来判断节点
以下是 readPreference 的几种常见模式及其解释:
1).primary:
‌说明‌:所有读取操作都会发送到主节点(primary).
‌适用场景‌:需要强一致性的读取操作，因为主节点上的数据是最新的.
‌示例‌:mongodb://host1:27017,host2:27017,host3:27017/?readPreference=primary

2).primaryPreferred:
‌说明‌:客户端会优先从主节点读取数据，如果主节点不可用，则从次节点(secondary)读取.
‌适用场景‌:大多数情况下需要一致性，但在主节点不可用时允许从次节点读取.
‌示例‌:mongodb://host1:27017,host2:27017,host3:27017/?readPreference=primaryPreferred

3).secondary:
‌说明‌:所有读取操作都会发送到次节点.如果次节点不可用，则读取操作会失败.
‌适用场景‌:对读取一致性要求不高，但需要分散读取负载的场景.
‌示例‌:mongodb://host1:27017,host2:27017,host3:27017/?readPreference=secondary

4).secondaryPreferred:
‌说明‌:客户端会优先从次节点读取数据，如果次节点不可用，则从主节点读取.
‌适用场景‌:希望优先从次节点读取以分散负载，但在次节点不可用时允许从主节点读取.
‌示例‌:mongodb://host1:27017,host2:27017,host3:27017/?readPreference=secondaryPreferred

5).nearest:
‌说明‌:客户端会从最接近(网络延迟最小)的节点读取数据，不论这个节点是主节点还是次节点.
‌适用场景‌:对读取延迟敏感的应用，希望尽可能快地获取数据.
‌示例‌:mongodb://host1:27017,host2:27017,host3:27017/?readPreference=nearest

22.mongodb的roles说明文档
https://www.mongodb.com/zh-cn/docs/manual/reference/built-in-roles/#database-user-roles
创建用户文档 https://www.mongodb.com/zh-cn/docs/manual/reference/method/db.auth/

23.下载地址
openssl: https://slproweb.com/products/Win32OpenSSL.html
jqlang: https://jqlang.github.io/jq/download/
Wireshark: https://www.wireshark.org/#downloadLink
OWASP ZAP: https://www.zaproxy.org/download/

24.npm 发布包
首先申请一个npm的账号
.npmignore: 该文件是用来忽略不需要发布的文件的
发布命令: npm publish --access public
删除包命令: npm unpublish 包名@版本号 --force
下载npm包zip文件: npm pack 包名

25.pm2 常用指令
启动: pm2 start ecosystem.config.js
pm2 stop ecosystem.config.js
pm2 ls
pm2 monit