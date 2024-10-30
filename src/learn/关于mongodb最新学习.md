1.使用mongotop
mongotop 5 --uri mongodb://root:admin@localhost:27017/admin // 每5s一次输出结果
2.使用mongostat
mongostat --username <username> --password <password> --authenticationDatabase <auth-db>
mongostat -n=20 5 -O=host,version --port 27017 --host localhost -u root -p admin --authenticationDatabase admin // 每5s一次,输出20次结束