/**
 * Create by oliver.wu 2024/9/25
 */
import cluster from 'node:cluster';
import type { Worker } from 'node:cluster';
import { availableParallelism } from 'node:os';
import parseEnv from '@/lib/parseEnv';
import { bootstrap } from './single.app';
import { has, omit } from 'lodash';

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
      // 延迟5s自动补充worker,保持进程数量恒等于threadNum
      // 加延迟是防止"启动即崩"场景(如DB连不上)下的无限fork风暴,与 ecosystem.config.js 的 restart_delay 保持一致
      setTimeout(() => {
        const newWorker = cluster.fork();
        console.log(
          `Refork worker ID:${newWorker.id}, processID : ${newWorker.process.pid}`,
        );
      }, 5000);
    });

    cluster.on('listening', function (worker: Worker) {
      //worker, address
      console.log(
        `Sub-thread-worker ID:${worker.id} listening, processID : ${worker.process.pid}`,
      );
    });

    // 同步所有进程的缓存
    for (const id in cluster.workers) {
      cluster.workers[id].on(
        'message',
        function (message: Record<string, any>) {
          // 含有notice节点的说明是项目内置的命令
          if (has(message, 'notice')) {
            // 当有其中一个进程收到消息,则往其他进程发送消息
            for (const pid in cluster.workers) {
              if (pid !== id) {
                // 考虑序列化和反序列化到内存中存的问题,同步内存到其他进程后取出来无法使用
                // 测试方法:某进程存在缓存后,kill掉该进程即可
                // 原因是发送消息时内部代码进行了序列化,导致取出来的对象和发送的不一致了
                cluster.workers[pid].send({
                  ...omit(message, 'notice'),
                  action: message.notice,
                });
              }
            }
          }
        },
      );
    }
  } else {
    await bootstrap();
    console.log(`Worker ID:${cluster.worker.id} started, Pid: ${process.pid}`);
  }
}
