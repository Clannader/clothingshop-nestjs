/**
 * Create by CC on 2022/7/30
 */
import { TestFactory } from './TestFactory';
import { TestOneAdapter } from './TestOneAdapter';
import { TestTwoAdapter } from './TestTwoAdapter';

describe('AbstractTest', () => {
  it('测试工厂实现', () => {
    const one = TestFactory.create({
      name: 'One',
    });
    expect(one).toBeInstanceOf(TestOneAdapter);
    expect(one.getAge()).toBe(28);
    expect(one.getTestName()).toBe('TestOneAdapter');
    // expect(one.getUserList()).toBe(['12', '32', '43', 'fads']);
    expect(one.getAdapter()).toBe('TestOneAdapter');

    const two = TestFactory.create({
      name: 'Two',
    });
    expect(two).toBeInstanceOf(TestTwoAdapter);
    expect(two.getTestName()).toBe('TestTwoAdapter');
    // expect(two.getUserList()).toBe(['fd', 'fasdf', 'cvc', 'jkjh']);
    expect(two.getAdapter()).toBe('TestTwoAdapter');
    expect(two.getAge()).toBe(30);
  });
});
