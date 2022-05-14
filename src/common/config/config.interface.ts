export interface ConfigServiceOptions {
  /**
   * If "true", registers `ConfigModule` as a global module.
   */
  isGlobal?: boolean;

  /**
   * Path to the environment file(s) to be loaded.
   */
  envFilePath?: string;

  /**
   * 监控文件有变化时重新加载配置文件
   */
  isWatch?: boolean;

  /**
   * Custom function to validate environment variables. It takes an object containing environment
   * variables as input and outputs validated environment variables.
   * If exception is thrown in the function it would prevent the application from bootstrapping.
   * Also, environment variables can be edited through this function, changes
   * will be reflected in the process.env object.
   */
  validate?: (config: Record<string, any>) => Record<string, any>;

  /**
   * Environment variables validation schema (Joi).
   */
  validationSchema?: any;

  /**
   * Schema validation options.
   */
  validationOptions?: Record<string, any>;
}
