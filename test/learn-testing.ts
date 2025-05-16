/**
 * Create by oliver.wu 2024/10/25
 */
// import { Observable, of, first, map, concatAll, firstValueFrom, fromEvent, from, take, defer } from 'rxjs';
// import { EventEmitter } from 'events'
// import { join } from 'path';
// import moment from 'moment';
// import fs from 'fs';
// import crypto from 'crypto';
// import CryptoJS from 'crypto-js';

// import { fromEvent, windowCount, map, skip, mergeAll, of, Subject } from 'rxjs';
// const clicks = new Subject();
// const result = clicks.pipe(
//   windowCount(3),
//   map(win => win.pipe(skip(1))), // skip first of every 3 clicks
//   mergeAll()                     // flatten the Observable-of-Observables
// );
// result.subscribe(x => console.log(x));
// clicks.next(1)
// clicks.next(2)
// clicks.next(3)
// clicks.next(4)
// clicks.next(5)
// clicks.next(6)
// clicks.next(7)
// clicks.next(8)

// const of1 = of(new Date())
// const from1 = from([new Date()])
// const defer1 = defer(() => {
//   return of(new Date())
// })
//
// of1.subscribe(console.log)
// from1.subscribe(console.log)
// defer1.subscribe(console.log)
//
// setTimeout(() => {
//   of1.subscribe(console.log)
//   from1.subscribe(console.log)
//   defer1.subscribe(console.log)
// }, 300)

// const emitter = new EventEmitter();
// const obEmit = fromEvent(emitter, 'click')
//
// obEmit.pipe(
//   map(data => `Processed: ${data.message}`),
// ).subscribe({
//   next: data => console.log(data),
//   error: err => console.error(err),
//   complete: () => console.log('Completed'),
// })
//
// emitter.emit('click', { type: 'desired_type', message: 'Hello, RxJS!' })
// emitter.emit('click', { type: 'other_type', message: 'This will be filtered out' });

// 无限的自增数列流
// const infinite = function* () {
//   let i = 0;
//
//   while (true) {
//     yield i++;
//   }
// };
// const observe = from(infinite())
// observe.pipe(
//   take(3) // 因为是无限的，仅仅取前三个
// ).subscribe(
//     {
//       next: value => console.log(value),
//       error: err => {},
//       complete: () => console.log('ta dam!')
//     }
//   );
// observe.pipe(
//   take(3) // 因为是无限的，仅仅取前三个
// ).subscribe(
//   {
//     next: value => console.log(value),
//     error: err => {},
//     complete: () => console.log('ta dam!')
//   }
// );

// const source = from([1, 2, 3, 4])
// source.pipe(take(3), map(value => value * 2)).subscribe(value => {
//   console.log(value)
// })
// const observable = new Observable((subscriber) => {
//   setInterval(() => {
//     subscriber.next(2);
//   }, 1000);
// });
//
// observable.pipe(
//   take(3),
//   map(value => {
//     return +value * 2;
//   })
// ).subscribe(value => {
//   console.log(value)
// })

// console.log(CryptoJS.lib.WordArray.random(32).toString())
// const key = crypto.createPrivateKey(privateKey) // 发现只能传私钥,公钥会报错
// console.log(key.export({
//   type: 'pkcs1',
//   format: 'pem'
// }))
// 发现不管传公钥还是私钥进去得出的结果都是一样的
// const key = crypto.createPublicKey(privateKey)
// const key2 = crypto.createPublicKey(publicKey)
// console.log(key.export({
//   type: 'pkcs1',
//   format: 'pem'
// }))
// console.log(key2.export({
//   type: 'pkcs1',
//   format: 'pem'
// }))
// const secretKey = crypto.createSecretKey(publicKey) // publicKey = fs.readFileSync(join(path, 'public-rsa.pem')) 需要buffer类型
// console.log(secretKey.export().toString('base64'))

// 学习Observable
// const observable = new Observable((subscriber) => {
//   console.log('just sync get result');
//   setTimeout(() => {
//     subscriber.next('2333')
//     subscriber.next('444')
//     subscriber.next('2355533')
//     subscriber.next('t555')
//     subscriber.complete();
//   }, 1000);
// });
// console.log('just before subscribe');
// const fun = async () => {
//   const [err, result] = await firstValueFrom(observable).then(resp => [null, resp]).catch(err => [err]);
//   console.log(err)
//   console.log(result)
// }
// fun().then()

// observable.subscribe({
//   next(x) {
//     console.log('got value ' + x);
//   },
//   error(err) {
//     console.error('something wrong occurred: ' + err);
//   },
//   complete() {
//     console.log('done');
//   },
// });
// console.log('just after subscribe');

// 研究nextTick,setTimeout,setImmediate
// 先跑同步,到nextTick,到setImmediate,如果有nextTick就进,setTimeout是最后的
// process.nextTick(() => {
//   console.log('2')
// })
// process.nextTick(() => {
//   console.log('3')
// })
// setTimeout(() => {
//   console.log('6')
// }, 0)
// console.log('1')
// setImmediate(() => {
//   console.log('4')
//   process.nextTick(() => {
//     console.log('5')
//   })
// })
// https://nodejs.org/docs/v22.11.0/api/timers.html#setimmediatecallback-args

// const pro = () => {
//   return new Promise<void>((resolve) => {
//     console.log('2');
//     setTimeout(() => {
//       console.log('4');
//       return resolve();
//     }, 1000);
//   });
// };
//
// const run = async () => {
//   console.log('1');
//   // nextTick发生在下一个异步之前
//   process.nextTick(() => {
//     console.log('3');
//   });
//   await pro();
//   console.log('5');
// };
// run().then((r) => console.log('6'));

// enum Name {
//   Send = 1,
//   List
// }
// console.log(Name.Send)
// console.log(Name.List)

// function logMethodCall(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//   const originalMethod = descriptor.value;
//
//   descriptor.value = function (...args: any[]) {
//     console.log(`Method ${propertyKey} called with arguments:`, args);
//     // 在这里可以添加任何你想要的动态行为
//     // ...
//
//     // 调用原始方法并返回其结果
//     return originalMethod.apply(this, args);
//   };
// }
//
// class Example {
//   @logMethodCall
//   exampleMethod(param1: string, param2: number): string {
//     return `Hello, ${param1}! You provided the number: ${param2}`;
//   }
// }
//
// const example = new Example();
// console.log(example.exampleMethod('World', 42));
// console.log(example.exampleMethod('World3', 442));
// console.log(example.exampleMethod('World1', 422));
// console.log(example.exampleMethod('World2', 432));

// import { ObjectId } from 'mongodb'
// const id = '676e1314ea060044295e0cd2'
// const Ob = new ObjectId(id);
// console.log(Ob.getTimestamp()) // 把_id解出来时间
// for (let i = 0; i < 2; i++) {
//   const obj = new ObjectId()
//   // console.log(obj.id)
//   console.log(obj.toJSON()) // 生成_id
// }
// import { v4 } from 'uuid';
// console.log(v4().replace(/\-/g, ''))

// import CryptoJS from 'crypto-js';
//
// function generateRandomLetters(length: number): string {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//   let result = '';
//   const bytes = CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
//
//   for (let i = 0; i < length; i++) {
//     const randomIndex = parseInt(bytes.substr(i * 2, 2), 16) % characters.length;
//     result += characters[randomIndex];
//   }
//
//   return result;
// }
//
// const randomLetters = generateRandomLetters(5);
// console.log(randomLetters);

import moment from 'moment';

// console.log(moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSSZ"));
// console.log(moment(undefined));
// console.log(moment(null));
// console.log(moment(1737450067113).isSame(moment(1737450067113)));
