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
    if (size > 100 * 1000) {
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
-f 是输入条件的文件路径,内容为select(.attr.durationMillis>=200 and .c=="COMMAND")
查找耗时大于200ms,命令为COMMAND,ns包含clothingshop,条件后面加?是因为有些日志没有attr.ns字段会报错
select(.attr.durationMillis>=200 and .c=="COMMAND" and (.attr.ns | test("clothingshop.*")?))
> [out file path], > 后面跟着输出文件路径或者文件名
jq -f D:\\MongoDB\\Server\\jsonQuery.txt -c D:\MongoDB\Server\7.0\log\mongod.log > queryResult.json

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
mongodump --host localhost --port 27018 --db "localStagingDB" --out "~\ImportDBData\local"

12.重新配置mongodb
D:\MongoDB\Server\4.2\bin\mongod.exe --config "D:\MongoDB\Server\4.2\bin\mongod.cfg"
D:\MongoDB\Server\4.2\bin\mongod.exe --config "D:\MongoDB\Server\4.2\bin\mongod.cfg"  --install --serviceName "MongoDB4.2" --serviceDisplayName "MongoDB4.2"

13.关于索引优化
索引筛选器
https://www.mongodb.com/zh-cn/docs/manual/reference/command/nav-plan-cache/
索引分析
https://www.mongodb.com/zh-cn/docs/manual/reference/explain-results/#explain-output-structure