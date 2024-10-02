/**
 * Create by CC on 2024/9/29
 */
const axios = require('axios')

const arr = [4, 5, 3, 2, 1]

arr.forEach(v => {
  const startTime = Date.now()
  axios.create({
    timeout: 30000,
  }).post('http://127.0.0.1:3003/test-axios-httpPool', {timeout: v}).then(() => {
    console.log(`耗时: ${(Date.now() - startTime) / 1000}s: 请求ID:${v}`)
  })
})

// 设置最大连接数4,其实nodejs中并没有什么连接池,只能说是最大连接数,TCP没有发送FIN(完成)握手时,该连接仍然可用
// 如上所述,并发5个请求,每个请求按照数字延迟返回,单位秒,由于设置了最大连接数是4,那么前面4个已经占用了4个连接
// 最后一个请求1需要等待前面4个连接有其中一个连接返回时才可以有连接可连,前面4个连接只有第4个请求最快返回(2s后返回)
// 所以当第4个连接返回时才有空闲的连接可用,所以第5个请求才会去连接,由于第5个请求延迟一秒返回,加上等待前面第4个连接(2s)
// 所以总耗时3s,与第3个请求(3s)一起返回,最后才是第一个请求(4s),第二个请求

