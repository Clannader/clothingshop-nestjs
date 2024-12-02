参考文档 https://rx.nodejs.cn/guide/operators
1.创建运算符
ajax: 使用ajax请求返回Observable对象,一般不使用.例如ajax.getJSON(url)
bindCallback: 调用回调函数返回Observable对象,类似Promise封装返回
bindNodeCallback: 同bindCallback,只不过需要遵循node回调函数的返回格式(err, result)
defer: 每次订阅都会创建一个新的Observable,如果里面发射的值是动态的,那么这个defer每次订阅获取的值都会不一样
empty: 废弃方法
from: 传入数组,iterable对象,然后自动循环发出值. Map Set都可以
fromEvent: 事件触发器返回Observable对象,如果在Nodejs中就是emit事件提交时触发
例如:
import { EventEmitter } from 'events'
const emitter = new EventEmitter()
const obEmit = fromEvent(emitter, 'click')
obEmit.subscribe(x => console.log(x))
emitter.emit('click', { type: 'desired_type', message: 'Hello, RxJS!' })

generate: 相当于使用for循环发送值
interval: 定时器发送值
of: 传入多个参数依次发送值
range: 按照某个范围发送值(x, y),从x开始,每次+1,发送y次
throwError: 抛出一个错误的Observable对象,通过error接收
例如: obEmit.subscribe({error: err => console.log(err)})

timer: 几秒后发送
例如: 和interval的区别
// 启动时马上触发,定时器1秒
timer(0, 1000).subscribe(n => console.log('timer', n));
// 启动时需要等1秒后才触发定时器
interval(1000).subscribe(n => console.log('interval', n));

iif: iff(() => 工厂条件, true时返回值, false时返回值),每次都需要重新订阅才能进行判断

1)案例1
延迟1秒后接收
const source = of(1)
source.pipe(delay(1000)).subscribe(x => console.log(x))
2)案例2
从现在开始,直到某个时间点结束
const currentDate = new Date();
const startOfNextMinute = new Date(
currentDate.getFullYear(),
currentDate.getMonth(),
currentDate.getDate(),
currentDate.getHours(),
currentDate.getMinutes() + 1
);
const source = interval(1000);
每秒发送一个值,直到下个分钟结束
const result = source.pipe(takeUntil(timer(startOfNextMinute)));
result.subscribe(console.log);

2.join创建运算符
combineLatest: 把多个Observable对象同时并集发射,每个对象有一个输出结果就合并一起返回. 这个是只要ob有返回值就会输出
concat: 把多个Observable对象按顺序发射,完成前一个Observable才到下一个Observable
forkJoin: 把多个Observable对象同时开始,全部完成后,取每个对象的最后结果的合集
merge: (ob1, ob2, ob3, 2),如果没有最后一个数字参数,则是合并多个ob对象同时发送,如果有参数,则是先执行前n个ob,完成其中一个后才同时执行后续n个ob
partition: 一个ob发射的值,按条件拆分出多个ob对象.例如:发射0123456789,可以按是否是偶数拆分单数ob和偶数ob
race: 在多个ob中,取发射值最快的ob用于订阅.应用于判断多个http请求,哪个最快返回
zip: 把多个ob每次发射的值合并返回,需要每个ob都有返回值才会合并返回

这里需要注意zip和combineLatest的区别


3.转换运算符
buffer:按条件缓冲值后发出
例子1:
import { interval, buffer, take, map } from 'rxjs';
const source = interval(1000).pipe(take(16));  // 每秒发一个值,最多发出16个值
// 创建一个 notifier observable，每3秒发出一个值
const notifier = interval(3000).pipe(take(3));  // 最多发出3个值,也就是取前面3个
// 使用 buffer 操作符
const buffered = source.pipe(
    buffer(notifier),  // 按notifier条件来缓冲值,条件是每3秒发出一次,那么就是收集3秒内的数据发一次,最多按这个条件发3次,剩余的值就不受这个条件限制
    // 可选：映射每个缓冲区，以做进一步处理
    map(bufferedValues => {
        return `Buffered Values: ${bufferedValues.join(', ')}`;
    })
);
// 订阅并打印输出
buffered.subscribe(x => console.log(x));
// 结果
Buffered Values: 0, 1, 2
Buffered Values: 3, 4, 5
Buffered Values: 6, 7, 8
Buffered Values: 9, 10, 11, 12, 13, 14, 15

例子2:
import { fromEvent, interval, buffer } from 'rxjs';
const clicks = fromEvent(document, 'click');
const intervalEvents = interval(1000);
const buffered = intervalEvents.pipe(buffer(clicks));
buffered.subscribe(x => console.log(x));
// 结果
每次点击输出intervalEvents发出的值的集合,按点击一次的条件缓冲值,也就是点一次发送一次

bufferCount: (缓冲几个, 从缓冲值的第几个值开始缓冲),把例子1的buffer改成bufferCount做测试,固定取多少个值,取够那么多个值才会返回
bufferCount(5, 2):设置缓冲5个值,下一次缓冲从上一个缓冲值的第2个下标后取5个值缓冲,也就是3(5-2)个旧值,2个新值

bufferTime: (time1, time2)每次收集time1时间产生的数据,如果是(2000, 5000)这样设置的就是每5秒收集5秒内的后2秒数据,也就是前3秒数据丢失
bufferToggle:
bufferWhen:

4.小结
·固定时间内只取第一个值,使用throttleTime
例子:
const ob = new Subject();
ob.pipe(throttleTime(1000)).subscribe(console.log);
ob.next(1);
ob.next(2);
setTimeout(() => {
    ob.next(5);
    ob.next(6);
}, 1020);
·固定时间内只取最后一个值,使用debounceTime
·收集固定时间内所有值,使用bufferTime
·收集固定数量值,使用bufferCount

5.需求
1.如何使用rxjs做类似vue3的ref声明,使用proxy对字段修改
2.如何实现抖动,限流,限制一分钟点击几次的功能
3.一分钟防止多次点击
4.父子组件的传参
5.实现每5秒内最多允许接收前3个值,多余的丢弃,不够3个值也取前3个

6.代码示例(实现每5秒内最多允许接收前3个值,多余的丢弃,不够3个值也取前3个)
方案1:
const ob = new Subject();
// 我感觉会内存溢出
// setInterval(() => {
//   ob.pipe(take(3)).subscribe(console.log);
// }, 5000)

方案2:
使用缓存做限制发送,定义一个固定key的有效期是5秒钟的缓存,只要产生值就加入,超过3个不next即可,感觉最理想的方案

方案3:
import { window, map, take, Subject, interval, mergeAll } from 'rxjs';
const sec = interval(5000); // 定义一个5秒的Observable对象,如果设置2400效果更好理解
// 结果是123--910--11--121314
const ob = new Subject()

ob.pipe(
    window(sec), // 使用window操作符,按每5秒分组,也是返回的是Observable对象
    map(win => win.pipe(take(3))), // 在每组对象中取前3个值
    mergeAll()   // 然后合并后发出,不能少这句
).subscribe(x => console.log(x));

setTimeout(() => {
ob.next(1)
ob.next(2)
ob.next(3)
ob.next(4)
}, 500)

setTimeout(() => {
ob.next(5)
ob.next(6)
ob.next(7)
ob.next(8)
}, 1500)

setTimeout(() => {
ob.next(9)
ob.next(10)
}, 2500)

setTimeout(() => {
ob.next(11)
}, 3500)

setTimeout(() => {
ob.next(12)
ob.next(13)
ob.next(14)
}, 6500)
