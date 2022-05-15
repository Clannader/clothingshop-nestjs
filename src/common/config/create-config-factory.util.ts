import { FactoryProvider } from '@nestjs/common/interfaces';
import { ConfigFactory } from './config.types';
import { ConfigFactoryKeyHost } from './register-as.util';

export function createConfigProvider(
  factory: ConfigFactory & ConfigFactoryKeyHost,
): FactoryProvider {
  return {
    provide: factory.KEY,
    useFactory: factory,
    inject: [],
  };
}
