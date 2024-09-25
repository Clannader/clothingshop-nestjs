/**
 * Create by oliver.wu 2024/9/25
 */
import cluster from 'cluster';
import { availableParallelism } from 'node:os';
import parseEnv from '@/lib/parseEnv';
import { bootstrap } from './single.app';

// TODO 发现好像是Nestjs不支持集群

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
    cluster.on('exit', function (worker, code) {
      //worker, code, signal
      //之所以打印2次监听是因为开启了http和https服务导致的
      console.log(
        `Sub-thread-worker ID:${worker.id} exit, processID : ${worker.process.pid}`,
      );
      console.log(`Sub-thread-code Code:${code}`);
    });

    cluster.on('listening', function (worker) {
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
