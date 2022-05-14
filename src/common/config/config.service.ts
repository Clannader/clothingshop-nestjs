import { Injectable, Inject } from '@nestjs/common';
import { CONFIG_OPTIONS } from './config.constants';
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { ConfigServiceOptions } from './config.interface';

@Injectable()
export class ConfigService {

  @Inject(CONFIG_OPTIONS)
  private readonly options: ConfigServiceOptions;

  constructor() {
    console.log(this.options)
  }
}
