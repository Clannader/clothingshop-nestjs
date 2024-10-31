/**
 * Create by oliver.wu 2024/9/25
 */
// 这样写是可以的,但是ts校验类型又过不去
// import * as cluster from 'node:cluster';
import type { Worker } from 'node:cluster'; // 用这个声明,使用时ts编译不过去
// @ts-ignore
const cluster = require('node:cluster'); // 用这个声明的话,又不是ts的写法,暂时这样弄吧
import { availableParallelism } from 'node:os';
import parseEnv from '@/lib/parseEnv';
import { bootstrap } from './single.app';

export async function clusterApp() {
  let numCPUs = availableParallelism();

  if (cluster.isPrimary) {
    console.log(`Master Pid:${process.pid} is running`);
    // 根据config.ini的进程数量开启多少个进程
    const threadNum = parseEnv.read('threadNum');
    if (!isNaN(threadNum)) {
      numCPUs = +threadNum;
    }

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', function (worker: Worker, code: number) {
      //worker, code, signal
      //之所以打印2次监听是因为开启了http和https服务导致的
      console.log(
        `Sub-thread-worker ID:${worker.id} exit, processID : ${worker.process.pid}`,
      );
      console.log(`Sub-thread-code Code:${code}`);
    });

    cluster.on('listening', function (worker: Worker) {
      //worker, address
      console.log(
        `Sub-thread-worker ID:${worker.id} listening, processID : ${worker.process.pid}`,
      );
    });
  } else {
    await bootstrap();
    console.log(`Worker ID:${cluster.worker.id} started, Pid: ${process.pid}`);
  }
}
