/**
 * Create by oliver.wu 2026/7/7
 * 自定义过滤XSS过滤规则
 */
import { FilterXSS } from 'xss';
import type { IFilterXSSOptions } from 'xss';

const options: IFilterXSSOptions = {};

const myXSS = new FilterXSS(options);
export const filterXss = myXSS;
