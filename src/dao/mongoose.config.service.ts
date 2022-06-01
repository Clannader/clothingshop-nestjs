/**
 * Create by CC on 2022/6/1
 */
import { Inject, Injectable } from '@nestjs/common';
import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { ConfigService } from '../common';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  @Inject()
  private configService: ConfigService;

  private connection: Connection;

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.getSecurityConfig('dbUrl'),
      retryDelay: 10 * 1000, // 重连的间隔时间10s
      retryAttempts: 30, // 重连次数
      user: this.configService.getSecurityConfig('dbUser'),
      pass: this.configService.getSecurityConfig('dbPws'),
      connectionFactory: (connection) => {
        //数据库连接错误时报错
        connection.on('error', function (err) {
          console.log('数据库出错');
          console.error(err);
        });

        connection.on('close', function () {
          //self
          console.error('数据库已关闭');
        });

        connection.on('disconnected', function () {
          console.warn('数据库已断开');
        });

        connection.on('reconnected', function () {
          console.log('数据库重连成功');
        });
        this.connection = connection;
        return connection;
      },
    };
  }

  getConnection() {
    return this.connection;
  }
}
