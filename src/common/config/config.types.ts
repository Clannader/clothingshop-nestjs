export type ConfigObject = Record<string, any>;

type ConfigFactoryReturnValue<T extends ConfigObject> = T | Promise<T>;

export type ConfigFactory<T extends ConfigObject = ConfigObject> =
  () => ConfigFactoryReturnValue<T>;
