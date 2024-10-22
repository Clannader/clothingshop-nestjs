/**
 * Create by CC on 2022/7/30
 */
import { AbstractTestAdapter } from './AbstractTestAdapter';

export class TestTwoAdapter extends AbstractTestAdapter {
  getTestName() {
    return 'TestTwoAdapter';
  }

  getUserList() {
    return ['one ', 'two', 'three', 'four'];
  }

  getAdapter(): string {
    return 'TestTwoAdapter';
  }

  public getAge(): number {
    return 30;
  }
}
