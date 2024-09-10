import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
import { ConfigService } from '@/common/config';

describe('ConfigService 默认加载', () => {
  let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.loadDefault()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService测试`, () => {
    expect(service).toBeDefined(); // 测试初始化
    expect(service.get<string>('undefined')).toBe(undefined);
    expect(service.get<number>('PORT')).toBe(5000); // 测试获取值是否正确
    expect(service.get<boolean>('isShow')).toBe(true);
    expect(service.get<string>('isString')).toBe('Hello');
    expect(typeof service.get<number>('PORT')).toBe('number'); // 测试获取值类型是否正确
    expect(typeof service.get<boolean>('isShow')).toBe('boolean');
    expect(typeof service.get<string>('isString')).toBe('string');
    expect(service.get<string>('dbUrl')).toBe(
      'X2agApWXC8SQS39fc+g0yn2l/hZwwWKclUXJOURINX37Y9xg9CRsKg==',
    );
    expect(service.getSecurityConfig('dbUrl')).toBe(
      'mongodb://127.0.0.1:27018/clothingshop',
    );
    expect(service.getSecurityConfig('dbName')).toBe(
      'M9kB1vUOFHzgzHa2VeIUkgeMZJ',
    );
    expect(service.getSecurityConfig('dbPws')).toBe('123456');
    expect(service.get<string>('HOMEPATH')).not.toBe(process.env['HOMEPATH']);
  });

  afterEach(async () => {
    await app.close();
  });
});
