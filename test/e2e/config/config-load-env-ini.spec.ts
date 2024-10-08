import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
import { ConfigService } from '@/common/config';

describe('ConfigService 同时加载env和ini', () => {
  let service: ConfigService;
  let app: INestApplication;
  let envBackup: NodeJS.ProcessEnv;

  beforeAll(() => {
    envBackup = process.env;
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.loadIniAndEnv()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, () => {
    expect(service.get<string>('PORT')).toBe(5000);
    expect(service.get<string>('isShow')).toBe(true);
    expect(service.get<string>('isString')).toBe('Hello');
    expect(service.get<string>('ENV_NAME')).toBe('clothingshop');
    expect(service.get<string>('ENV_APP_HOME')).toBe('/${ENV_NAME}/index');
    expect(service.get<string>('dbUrl')).toBe(
      'X2agApWXC8SQS39fc+g0yn2l/hZwwWKclUXJOURINX37Y9xg9CRsKg==',
    );
    expect(service.getSecurityConfig('dbUrl')).toBe(
      'mongodb://127.0.0.1:27018/clothingshop',
    );
    expect(process.env['ENV_PORT']).toBe('5000');
    expect(process.env['ENV_isShow']).toBe('true');
    expect(process.env['ENV_isString']).toBe('Hello');
    expect(process.env['ENV_APP_HOME']).toBe('/${ENV_NAME}/index');
  });

  afterEach(async () => {
    process.env = envBackup;
    await app.close();
  });
});
