/**
 * Create by CC on 2024/9/29
 */
const express = require('express')
const app = express()
const http = require('http')

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({limit:'5mb',extended: false}));

app.all('/*', (req, res, next) => {
  console.log(req.url)
  next()
})

app.post('/test-function', (req, res) => {
  setTimeout(() => {
    return res.send({code: 1})
  }, req.body.timeout * 1000)
})

const server = http
  .createServer(app)
  .listen(3004, 'localhost')
  .on('error', err => {
    console.error(err)
  }).on('listening', () => {
    console.log('服务器启动成功')
  })
server.keepAliveTimeout = 2000


process.on('uncaughtException', err => {
  console.error(err)
})

