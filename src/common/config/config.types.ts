export type ConfigObject = Record<string, any>;

export type ConfigFactoryReturnValue<T extends ConfigObject> = T | Promise<T>;

export type ConfigFactory<T extends ConfigObject = ConfigObject> =
  () => ConfigFactoryReturnValue<T>;
