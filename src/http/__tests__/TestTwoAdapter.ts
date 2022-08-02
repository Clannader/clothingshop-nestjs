/**
 * Create by CC on 2022/7/30
 */
import { AbstractTestAdapter } from './AbstractTestAdapter';

export class TestTwoAdapter extends AbstractTestAdapter {
  getTestName() {
    return 'TestTwoAdapter';
  }

  getUserList() {
    return ['fd', 'fasdf', 'cvc', 'jkjh'];
  }

  getAdapter(): string {
    return 'TestTwoAdapter';
  }

  public getAge(): number {
    return 30;
  }
}
