/**
 * Create by CC on 2022/7/30
 */
import { TestOneAdapter } from './TestOneAdapter';
import { TestTwoAdapter } from './TestTwoAdapter';
import { AbstractTestAdapter } from './AbstractTestAdapter';
// import { ITestInterface } from './ITestInterface';

export type options = {
  name: 'One' | 'Two';
};

export class TestFactory {
  static create(opt: options): AbstractTestAdapter {
    let adapter: AbstractTestAdapter;
    switch (opt.name) {
      case 'One':
        adapter = new TestOneAdapter();
        break;
      case 'Two':
        adapter = new TestTwoAdapter();
        break;
    }
    return adapter;
  }
}
