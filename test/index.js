/* eslint-env mocha */
import expect from 'expect';
import Translator from '../src/index';

/* eslint-disable */
function pluralizeRussian(n) {
  const s = String(n).split('.');
  const i = s[0];
  const v0 = !s[1];
  const i10 = i.slice(-1);
  const i100 = i.slice(-2);
  return (v0 && i10 == 1 && i100 != 11) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12
          || i100 > 14)) ? 'few'
      : (v0 && i10 == 0 || v0 && (i10 >= 5 && i10 <= 9)
          || v0 && (i100 >= 11 && i100 <= 14)) ? 'many'
      : 'other';
}
/* eslint-enable */

describe('t', () => {
  let translator;
  beforeEach(() => {
    translator = new Translator({
      simple: 'value',
      interpolated: '{{a}} b {{c}}',
      duck: '{{count}} duck',
      duck_plural: '{{count}} ducks',
      nested: { xyz: 'ghi' },
    });
  });

  it('returns values', () => {
    expect(translator.t('simple')).toEqual('value');
  });

  it('interpolates {{data}}', () => {
    expect(translator.t('interpolated', { a: 'd', c: 'f' })).toEqual('d b f');
  });

  it('finds nested keys', () => {
    expect(translator.t('nested.xyz')).toEqual('ghi');
  });

  it('pluralizes english by default', () => {
    expect(translator.t('duck', { count: 0 })).toEqual('0 ducks');
    expect(translator.t('duck', { count: 1 })).toEqual('1 duck');
    expect(translator.t('duck', { count: 2 })).toEqual('2 ducks');
  });

  it('can fall back if specific messages do not exist', () => {
    expect(translator.t(['nested.abc', 'nested.xyz'])).toEqual('ghi');
  });

  it('throws if translation is not available', () => {
    expect(() => translator.t('doesnotexist')).toThrow(/Key "doesnotexist" does not exist\./);
  });
});

describe('parts', () => {
  let translator;
  beforeEach(() => {
    translator = new Translator({
      interpolated: '{{a}} b {{c}}',
    });
  });

  it('returns interpolated string as an array of parts', () => {
    expect(translator.parts('interpolated', { a: 'd', c: 'f' })).toEqual(['', 'd', ' b ', 'f', '']);
  });

  it('allows non string values', () => {
    const sym = Symbol('test');
    const obj = [{ example: 'object' }];

    expect(translator.parts('interpolated', { a: sym, c: obj })).toEqual(['', sym, ' b ', obj, '']);
  });
});

describe('fallback', () => {
  let fallback;
  let translator;
  beforeEach(() => {
    fallback = new Translator({
      simple: 'value',
      interpolated: '{{a}} b {{c}}',
      defaultDuck: '{{count}} duck',
      defaultDuck_plural: '{{count}} ducks',
      nested: { xyz: 'ghi', abc: 'def' },
    });

    translator = new Translator({
      nested: { xyz: 'subvalue' },
      duck: '{{count}} (one) duck',
      duck_few: '{{count}} (few) ducks',
      duck_many: '{{count}} (many) ducks',
    }, {
      plural: pluralizeRussian,
      default: fallback,
    });
  });

  it('can fall back to a different language if a key does not exist', () => {
    expect(translator.t('simple')).toEqual('value');
    expect(translator.t('nested.abc')).toEqual('def');
  });

  it('prefers the local value', () => {
    expect(translator.t('nested.xyz')).toEqual('subvalue');
  });

  it('throws if translation is not available in any fallback', () => {
    expect(() => translator.t('doesnotexist')).toThrow(/Key "doesnotexist" does not exist\./);
  });

  it('uses the correct pluralization option', () => {
    expect(translator.t('duck', { count: 0 })).toEqual('0 (many) ducks');
    expect(translator.t('duck', { count: 1 })).toEqual('1 (one) duck');
    expect(translator.t('duck', { count: 2 })).toEqual('2 (few) ducks');
    expect(translator.t('duck', { count: 4 })).toEqual('4 (few) ducks');
    expect(translator.t('duck', { count: 5 })).toEqual('5 (many) ducks');

    expect(translator.t('defaultDuck', { count: 0 })).toEqual('0 ducks');
    expect(translator.t('defaultDuck', { count: 1 })).toEqual('1 duck');
    expect(translator.t('defaultDuck', { count: 2 })).toEqual('2 ducks');
  });
});
