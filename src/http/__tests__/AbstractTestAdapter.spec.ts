/**
 * Create by CC on 2022/7/30
 */
import { ITestInterface } from './ITestInterface.spec';

export abstract class AbstractTestAdapter implements ITestInterface {
  abstract getTestName(): string;

  public getAge(): number {
    return 28;
  }

  abstract getUserList(userName?: string): string[];

  abstract getAdapter(): string;

  public init() {
    console.log('init()');
  }
}
