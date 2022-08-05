/**
 * Create by CC on 2022/7/30
 */
import { AbstractTestAdapter } from './AbstractTestAdapter';

export class TestOneAdapter extends AbstractTestAdapter {
  getTestName() {
    return 'TestOneAdapter';
  }

  getUserList() {
    return ['12', '32', '43', 'fads'];
  }

  getAdapter(): string {
    return 'TestOneAdapter';
  }
}
