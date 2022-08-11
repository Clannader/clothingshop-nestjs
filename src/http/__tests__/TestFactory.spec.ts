/**
 * Create by CC on 2022/7/30
 */
import { TestOneAdapter } from './TestOneAdapter.spec';
import { TestTwoAdapter } from './TestTwoAdapter.spec';
import { AbstractTestAdapter } from './AbstractTestAdapter.spec';

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
