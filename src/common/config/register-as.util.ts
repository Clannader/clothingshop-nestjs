import { ConfigModule } from '..';
import {
  AS_PROVIDER_METHOD_KEY,
  PARTIAL_CONFIGURATION_KEY,
  PARTIAL_CONFIGURATION_PROPNAME,
} from './config.constants';
import { ConfigObject, ConfigFactory } from './config.types';

export interface ConfigFactoryKeyHost<T = unknown> {
  KEY: string;
  asProvider(): {
    imports: [ReturnType<typeof ConfigModule.forFeature>];
    useFactory: (config: T) => T;
    inject: [string];
  };
}

/**
 * Registers the configuration object behind a specified token.
 */
export function registerAs<
  TConfig extends ConfigObject,
  TFactory extends ConfigFactory = ConfigFactory<TConfig>,
>(
  token: string,
  configFactory: TFactory,
): TFactory & ConfigFactoryKeyHost<ReturnType<TFactory>> {
  const defineProperty = (key: string, value: unknown) => {
    Object.defineProperty(configFactory, key, {
      configurable: false,
      enumerable: false,
      value,
      writable: false,
    });
  };

  defineProperty(PARTIAL_CONFIGURATION_KEY, token);
  defineProperty(PARTIAL_CONFIGURATION_PROPNAME, token);
  defineProperty(AS_PROVIDER_METHOD_KEY, () => ({
    imports: [ConfigModule.forFeature(configFactory)],
    useFactory: (config: unknown) => config,
    inject: [token],
  }));
  return configFactory as TFactory & ConfigFactoryKeyHost<ReturnType<TFactory>>;
}
