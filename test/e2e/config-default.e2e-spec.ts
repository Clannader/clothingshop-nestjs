import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '../../src/common/config';

describe('ConfigService 默认加载', () => {
  let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.loadDefault()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService初始化`, () => {
    expect(service).toBeDefined();
    expect(service.get<string>('undefined')).toBe(undefined);
    expect(service.get<number>('PORT')).toBe(5000);
    expect(service.get<boolean>('isShow')).toBe(true);
    expect(service.get<string>('isString')).toBe('Hello');
    expect(typeof service.get<number>('PORT')).toBe('number');
    expect(typeof service.get<boolean>('isShow')).toBe('boolean');
    expect(typeof service.get<string>('isString')).toBe('string');
    expect(service.get<string>('dbUrl')).toBe(
      'M9kB1vUOFHzgzHa2VeIUkgeMZJ/4SQzeJ6ehKlLZPTz6fmy7SBEY2A==',
    );
    expect(service.getSecurityConfig('dbUrl')).toBe(
      'mongodb://127.0.0.1:27018/clothingshop',
    );
  });

  afterEach(async () => {
    await app.close();
  });
});
