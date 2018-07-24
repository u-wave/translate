import dlv from 'dlv';
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
  constructor(strings, opts = {}) {
    this.strings = strings;
    this.t = this.t.bind(this);

    this.plural = opts.plural || defaultPlural;
    this.default = opts.default;
  }

  parts(key, data) {
    const plural = has(data, 'count') ? this.plural(data.count) : 'one';
    const keys = [];
    if (plural === 'other') keys.push(`${key}_plural`);
    keys.push(`${key}_${plural}`);
    if (plural === 'one') keys.push(key);

    const template = first(keys, k => dlv(this.strings, k));
    if (template === undefined) {
      if (this.default) return this.default.parts(key, data);

      throw new Error(`@u-wave/translate: Key "${key}" does not exist.`);
    }

    return template.split(/\{\{(.*?)\}\}/).map((part, i) => {
      if (i % 2) return dlv(data, part);
      return part;
    }, []);
  }

  t(key, data) {
    const arr = this.parts(key, data);

    return arr.join('');
  }
}
