import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '../../src/common/config';

describe('ConfigService 同时加载env和ini', () => {
  let service: ConfigService;
  let app: INestApplication;
  let envBackup: NodeJS.ProcessEnv;

  beforeAll(() => {
    envBackup = process.env;
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.loadIniAndEnv()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService初始化`, () => {
    expect(service.get<string>('PORT')).toBe(5000);
    expect(service.get<string>('isShow')).toBe(true);
    expect(service.get<string>('isString')).toBe('Hello');
    expect(service.get<string>('ENV_NAME')).toBe('clothingshop');
    expect(service.get<string>('ENV_APP_HOME')).toBe('/${ENV_NAME}/index');
    expect(service.get<string>('dbUrl')).toBe(
      'M9kB1vUOFHzgzHa2VeIUkgeMZJ/4SQzeJ6ehKlLZPTz6fmy7SBEY2A==',
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
