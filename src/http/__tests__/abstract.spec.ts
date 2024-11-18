/**
 * Create by CC on 2022/7/30
 */
import { TestFactory } from './TestFactory';
import { TestOneAdapter } from './TestOneAdapter';
import { TestTwoAdapter } from './TestTwoAdapter';
import { TestService } from './TestService';

describe('AbstractTest', () => {
  it('测试工厂实现', () => {
    const one = TestFactory.create({
      name: 'One',
    });
    expect(one).toBeInstanceOf(TestOneAdapter);
    expect(one.getAge()).toBe(28);
    expect(one.getTestName()).toBe('TestOneAdapter');
    expect(one.getUserList()).toStrictEqual(['oliver', 'flex', 'sam', 'jack']);
    expect(one.getAdapter()).toBe('TestOneAdapter');

    const two = TestFactory.create({
      name: 'Two',
    });
    expect(two).toBeInstanceOf(TestTwoAdapter);
    expect(two.getTestName()).toBe('TestTwoAdapter');
    expect(two.getUserList()).toStrictEqual(['one ', 'two', 'three', 'four']);
    expect(two.getAdapter()).toBe('TestTwoAdapter');
    expect(two.getAge()).toBe(30);
  });

  it('测试工厂服务类', () => {
    const one = TestFactory.create({
      name: 'One',
    });
    const service = new TestService(one);
    expect(service.getName()).toBe(one.getTestName());

    const two = TestFactory.create({
      name: 'Two',
    });
    const service2 = new TestService(two);
    expect(service2.getName()).toBe(two.getTestName());
  });
});
