/**
 * Create by CC on 2022/7/30
 */
import { TestFactory } from './TestFactory';
// import { AbstractTestAdapter } from './AbstractTestAdapter';
import { TestOneAdapter } from './TestOneAdapter';
import { TestTwoAdapter } from './TestTwoAdapter';

describe('AbstractTest', () => {
  it('测试工厂实现', () => {
    const one = TestFactory.create({
      name: 'One',
    });
    expect(one).toBeInstanceOf(TestOneAdapter);

    const two = TestFactory.create({
      name: 'Two',
    });
    expect(two).toBeInstanceOf(TestTwoAdapter);
  });
});
