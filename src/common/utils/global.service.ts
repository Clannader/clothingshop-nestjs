import { Injectable } from '@nestjs/common';
import * as globalVariable from '../constants';

@Injectable()
export class GlobalService {
  static GlobalStatic: object = globalVariable;

  lang() {
    return 'dsffsd';
  }
}
