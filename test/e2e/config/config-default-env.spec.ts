import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
import { ConfigService } from '@/common/config';

describe('ConfigService 默认加载环境变量文件', () => {
  let service: ConfigService;
  let app: INestApplication;
  let envBackup: NodeJS.ProcessEnv;

  beforeAll(() => {
    envBackup = process.env;
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.loadEnvFile()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, () => {
    expect(service).toBeDefined();
    expect(service.get<string>('undefined')).toBe(undefined);
    expect(service.get<number>('ENV_PORT')).toBe(5000);
    expect(service.get<boolean>('ENV_isShow')).toBe(true);
    expect(service.get<string>('ENV_isString')).toBe('Hello');
    expect(typeof service.get<number>('ENV_PORT')).toBe('number');
    expect(typeof service.get<boolean>('ENV_isShow')).toBe('boolean');
    expect(typeof service.get<string>('ENV_isString')).toBe('string');
    expect(service.get<string>('ENV_APP_HOME')).toBe('/clothingshop/index');
    expect(service.get<string>('HOMEPATH')).toBe(process.env['HOMEPATH']);
    expect(process.env['ENV_PORT']).toBe('5000');
    expect(process.env['ENV_isShow']).toBe('true');
    expect(process.env['ENV_isString']).toBe('Hello');
    expect(process.env['ENV_APP_HOME']).toBe('/clothingshop/index');
    // expect(process.env['HOMEPATH']).toBe(process.env['HOMEPATH']);
  });

  afterEach(async () => {
    process.env = envBackup;
    await app.close();
  });
});
