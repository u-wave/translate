import getPath from 'dlv';
import defaultPlural from '../plurals/en';

function first(arr, fn) {
  for (let i = 0; i < arr.length; i += 1) {
    const v = fn(arr[i]);
    if (v !== undefined) return v;
  }
  return undefined;
}

function has(o, p) {
  return o && Object.prototype.hasOwnProperty.call(o, p);
}

export default class Translator {
  constructor(strings, options = {}) {
    this.strings = strings;
    this.t = this.t.bind(this);

    this.plural = options.plural || defaultPlural;
    this.default = options.default;
  }

  parts(key, data, options = {}) {
    if (Array.isArray(key)) {
      return first(key, (k) => this.parts(k, data, {
        throw: false,
      }));
    }

    const plural = has(data, 'count') ? this.plural(data.count) : 'one';
    const pluralKeys = [];
    if (plural === 'other') pluralKeys.push(`${key}_plural`);
    pluralKeys.push(`${key}_${plural}`);
    if (plural === 'one') pluralKeys.push(key);

    const template = first(pluralKeys, (k) => getPath(this.strings, k));
    if (template === undefined) {
      if (this.default) return this.default.parts(key, data, options);

      if (options && options.throw === false) {
        return undefined;
      }
      throw new Error(`@u-wave/translate: Key "${key}" does not exist.`);
    }

    return template.split(/\{\{(.*?)\}\}/).map((part, i) => {
      if (i % 2) return getPath(data, part);
      return part;
    }, []);
  }

  t(key, data) {
    const arr = this.parts(key, data);

    return arr.join('');
  }
}
