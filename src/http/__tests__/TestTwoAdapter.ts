/**
 * Create by CC on 2022/7/30
 */
import { AbstractTestAdapter } from './AbstractTestAdapter';

export class TestTwoAdapter extends AbstractTestAdapter {
  getTestName() {
    return 'TestTwoAdapter';
  }

  getUserList(userName: string) {
    return ['fd', 'fasdf', 'cvc', 'jkjh'].filter((v) => v === userName);
  }

  getAdapter(): string {
    return 'TestTwoAdapter';
  }
}
