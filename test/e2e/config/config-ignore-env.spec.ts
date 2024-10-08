import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
import { ConfigService } from '@/common/config';

describe('ConfigService 忽略环境变量值', () => {
  let service: ConfigService;
  let app: INestApplication;
  let envBackup: NodeJS.ProcessEnv;

  beforeAll(() => {
    envBackup = process.env;
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.ignoreEnvVars()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, () => {
    expect(service).toBeDefined();
    // 忽略env的值,相当于get不到env的值,但是环境变量里面有这个值
    expect(service.get<string>('undefined')).toBe(undefined);
    expect(service.get<number>('PORT')).toBe(5000);
    expect(service.get<boolean>('isShow')).toBe(true);
    expect(service.get<string>('isString')).toBe('Hello');
    expect(typeof service.get<number>('PORT')).toBe('number');
    expect(typeof service.get<boolean>('isShow')).toBe('boolean');
    expect(typeof service.get<string>('isString')).toBe('string');
    expect(service.get<string>('ENV_APP_HOME')).toBe(undefined);
    expect(service.get<string>('ENV_PORT')).toBe(undefined);
    expect(service.get<string>('HOMEPATH')).toBe(undefined);
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
