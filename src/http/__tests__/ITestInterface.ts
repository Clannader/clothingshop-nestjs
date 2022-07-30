/**
 * Create by CC on 2022/7/30
 * 测试接口类
 */
export interface ITestInterface {
  getTestName(): string;
  getAge(): number;
  getUserList(userName?: string): string[];
}
