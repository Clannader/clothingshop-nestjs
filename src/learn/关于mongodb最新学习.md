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