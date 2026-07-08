/**
 * Create by oliver.wu 2026/7/7
 */
import { isPlainObject } from 'lodash';

const TEST_REGEX = /^\$|\./;
// const TEST_REGEX_WITHOUT_DOT = /^\$/;
const REPLACE_REGEX = /^\$|\./g;

type SanitizeOptions = {
  replaceWith: string;
};

function withEach(target: Record<string, any>, cb: Function) {
  (function act(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(act);
    } else if (isPlainObject(obj)) {
      Object.keys(obj).forEach(function (key) {
        const val = obj[key];
        const resp = cb(obj, val, key);
        if (resp.shouldRecurse) {
          act(obj[resp.key || key]);
        }
      });
    }
  })(target);
}

export function mongoSanitize(
  target: Record<string, any>,
  options: SanitizeOptions = { replaceWith: '_' },
) {
  const regex = TEST_REGEX;

  let replaceWith = null;
  if (!regex.test(options.replaceWith) && options.replaceWith !== '.') {
    replaceWith = options.replaceWith;
  }

  withEach(target, function (obj: { [x: string]: any }, val: any, key: string) {
    let shouldRecurse = true;

    if (regex.test(key)) {
      delete obj[key];
      if (replaceWith) {
        key = key.replace(REPLACE_REGEX, replaceWith);
        if (
          key !== '__proto__' &&
          key !== 'constructor' &&
          key !== 'prototype'
        ) {
          obj[key] = val;
        }
      } else {
        shouldRecurse = false;
      }
    }

    return {
      shouldRecurse: shouldRecurse,
      key: key,
    };
  });

  return target;
}
