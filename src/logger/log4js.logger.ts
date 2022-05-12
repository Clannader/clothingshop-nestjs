import * as Log4js from 'log4js';
import { join } from 'path';

const baseLogPath = join(__dirname, '/../../logs/server.log');
const baseFileLogPath = join(__dirname, '/../../fileLogs/fileLog.log');

function replaceConsole(logger) {
  function replaceWith(fn) {
    return function (...args) {
      fn.apply(logger, args);
    };
  }

  ['log', 'debug', 'info', 'warn', 'error'].forEach(function (item) {
    console[item] = replaceWith(item === 'log' ? logger.info : logger[item]);
  });
}

Log4js.configure({
  appenders: {
    fileLogs: {
      type: 'file',
      filename: baseFileLogPath,
      maxLogSize: 10 * 1024 * 1024, // = 10Mb
      numBackups: 5, // keep five backup files
      alwaysIncludePattern: true,
      /**
       * 这里发现有个好玩的配置
       * 1.使用type:'dateFile',可以使用pattern配置隔多久生成一次文件
       * 例如想每次运行代码生成新的,则配置
       * {    type:'dateFile',
       *      filename: escapePath(process.env.LOG_PATH + 'file_logs\\'),
       *      pattern: 'file_' + new Date.format('yyyy-MM-dd_HH:mm:ss') + '.log'
       *      //也可以配置进程号process.pid.toString()
       *  }
       */
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss,SSS} [%z] %p %c - %m',
      },
    },
    serverLogs: {
      type: 'dateFile',
      filename: baseLogPath,
      pattern: 'yyyy-MM-dd',
      level: 'all',
      // daysToKeep: 10, //删除10天前的日志,感觉没什么用
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern:
          '%d{yyyy-MM-dd hh:mm:ss,SSS} %x{author} %X{appName} %p [%x{originalContext}] %c - %m',
        tokens: {
          author: function (/*logEvent*/) {
            // logEvent =>
            // let _logEvent = {
            //     "startTime": "2019-09-13T06:18:02.679Z",
            //     "categoryName": "console",
            //     "data": ["require globalServer"],
            //     "level": {"level": 20000, "levelStr": "INFO", "colour": "green"},
            //     "context": {},
            //     "pid": 5740
            // }
            // 这里面的data节点可以通过info的传参传进来
            // 例如: console.info('xxxx', {type: 'xxxx'})
            return 'oliver';
          },
          originalContext: function (logEvent: Log4js.LoggingEvent) {
            return logEvent.context['originalContext'] || 'Console';
          },
        },
      },
    },
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        //%[ %]标志从哪到哪需要加颜色显示
        pattern:
          '%[[%d{yyyy-MM-dd hh:mm:ss,SSS}] %z %p [%x{originalContext}] %c -%] %m',
        tokens: {
          originalContext: function (logEvent: Log4js.LoggingEvent) {
            return logEvent.context['originalContext'] || 'Console';
          },
        },
      },
    },
  },
  categories: {
    default: {
      appenders: ['serverLogs', 'console'],
      level: 'all',
    },
    fileLogs: {
      appenders: ['fileLogs', 'console'],
      //appenders: ['fileLogs', 'console']这样配置可以在控制台输出
      //appenders: ['fileLogs']不需要在控制台输出
      level: 'all',
    },
  },
});

const consoleLogger = Log4js.getLogger('console');
replaceConsole(consoleLogger);
consoleLogger.addContext('appName', 'cmsServer');
