/**
 * Create by CC on 2024/9/29
 */
const express = require('express')
const app = express()
const http = require('http')

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({limit:'5mb',extended: false}));

const axios = require('axios')
// const keepAliveAgent = require('agentkeepalive').HttpsAgent // HTTPS协议
const keepAliveHttpAgent = require('agentkeepalive') // HTTP协议

const httpAgent = new keepAliveHttpAgent({
  maxSockets: 4,
  // maxFreeSockets: 4,
  // timeout: 60000,
  // freeSocketTimeout: 30000,
  keepAlive: true,
  // keepAliveMsecs: 30000,
  // socketActiveTTL: 20000,
  // keepAliveInitialDelay: 10000,
})

const axiosInstance = axios.create({
  timeout: 30000,
  // httpsAgent,
  httpAgent: httpAgent
})

app.all('/*', (req, res, next) => {
  console.log(req.url)
  next()
})

app.post('/test-axios-httpPool', (req, res) => {
  axiosInstance.post('http://localhost:3004/test-function', req.body).then(resp => {
    return res.send(resp.data)
  }).catch(err => {
    return res.send(err)
  })
})

const server = http
  .createServer(app)
  .listen(3003, 'localhost')
  .on('error', err => {
    console.error(err)
  }).on('listening', () => {
    console.log('服务器启动成功')
  })
server.keepAliveTimeout = 2000


process.on('uncaughtException', err => {
  console.error(err)
})

