/**
 * Create by CC on 2022/7/31
 */
import { AbstractTestAdapter } from './AbstractTestAdapter';

export class TestService {
  private readonly adapter: AbstractTestAdapter;

  constructor(adapter: AbstractTestAdapter) {
    this.adapter = adapter;
  }

  getName() {
    return this.adapter.getTestName();
  }
}
