import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@T/config/app.module';
import { ConfigService } from '@/common';

describe('ConfigService 忽略环境变量文件', () => {
  let service: ConfigService;
  let app: INestApplication;
  let envBackup: NodeJS.ProcessEnv;

  beforeAll(() => {
    envBackup = process.env;
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.ignoreEnvFile()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, () => {
    expect(service).toBeDefined();
    // 忽略env的文件,相当于get不到env的值,但是环境变量里面也没有有这个值
    expect(service.get<string>('undefined')).toBe(undefined);
    expect(service.get<number>('PORT')).toBe(5000);
    expect(service.get<boolean>('isShow')).toBe(true);
    expect(service.get<string>('isString')).toBe('Hello');
    expect(typeof service.get<number>('PORT')).toBe('number');
    expect(typeof service.get<boolean>('isShow')).toBe('boolean');
    expect(typeof service.get<string>('isString')).toBe('string');
    expect(service.get<string>('ENV_APP_HOME')).toBe(undefined);
    expect(service.get<string>('JAVA_HOME')).toBe(undefined);
    expect(process.env['ENV_PORT']).toBe(undefined);
    expect(process.env['ENV_isShow']).toBe(undefined);
    expect(process.env['ENV_isString']).toBe(undefined);
    expect(process.env['ENV_APP_HOME']).toBe(undefined);
    expect(process.env['JAVA_HOME']).toBe('D:\\java1.8\\jdk\\bin');
  });

  afterEach(async () => {
    process.env = envBackup;
    await app.close();
  });
});
