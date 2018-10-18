# @u-wave/translate

Basic key-based translation with pluralization for web apps.

This is intentionally barebones—loading translations, switching languages etc is left to the user. The best way to handle switching languages depends on where the library is used. For React apps, the current language can be stored in a top-level component's state. In server-side Express apps, the current language can be stored on the Request object.

[Installation](#installation) - [Usage](#usage) - [API](#api) - [Related](#related) - [License: MIT](#license)

[![Build Status](https://travis-ci.com/u-wave/translate.svg?branch=master)](https://travis-ci.com/u-wave/translate)
[![Coverage Status](https://coveralls.io/repos/github/u-wave/translate/badge.svg?branch=master)](https://coveralls.io/github/u-wave/translate?branch=master)
[![npm](https://img.shields.io/npm/v/@u-wave/translate.svg)](https://npmjs.com/package/@u-wave/translate)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@u-wave/translate.svg)](https://bundlephobia.com/result?p=@u-wave/translate)

## Installation

```
npm install --save @u-wave/translate
```

## Usage

Using this library looks something like this:

```js
import Translator from '@u-wave/translate';
import pluralizeCs from '@u-wave/translate/plurals/cs';

// Define your strings.
const resources = {
  en: {
    users: {
      guests: '{{count}} guest',
      guests_plural: '{{count}} guests',
    },
  },
  cs: {
    users: {
      guests: '{{count}} návštěvník'
      guests_few: '{{count}} návštěvníci'
      guests_many: '{{count}} návštěvníků'
    },
  },
};

// Create an instance for a language, with a pluralization function.
const translator = new Translator(resources.cs, { plural: pluralizeCs });

const guests = translator.t('users.guests', { count: n });
```

A Translator instance can be used for a single language. `@u-wave/translate` comes with pluralization functions for a lot of languages. Pluralization functions are configured using the `plural` option.

The main way to retrieve translations is using the `t()` method. The first argument is a string key, which can contain `.`s for nested property access. The second argument is an object containing interpolation data. Each occurrence of `{{propName}}` in the translation string is replaced with the appropriate value from the interpolation data object. There is a special interpolation data key named `count`, which is used for pluralization.

Plural forms for a given key are specified by adding another key, suffixed with `_plural` (among others):

```js
const { t } = new Translator({
  login: 'Log in',
  register: 'Register',
  online: 'One other user is online',
  online_plural: '{{count}} other users are online'
})

t('login') // 'Log in'
t('register') // 'Register'
t('online', { count: 1 }) // 'One other user is online'
t('online', { count: 2 }) // '2 other users are online'
t('online', { count: 0 }) // '0 other users are online'
```

In English, there are only two plural forms, so this works. Many languages have more than two plural forms, though. For example, Arabic has forms for zero, one, two, "few", and "many" items.

```js
import pluralizeArabic from '@u-wave/translate/plurals/ar';

const { t } = new Translator({
  online_zero: 'Nobody is online',
  online_one: 'One other user is online',
  online_two: 'Two other users are online',
  // 3-10
  online_few: '{{count}} (a few) other users are online',
  // 11-99
  online_many: '{{count}} (many) other users are online',
  // the rest
  online: '{{count}} other users are online',
}, { plural: pluralizeArabic })
```

The way this works is that pluralization functions return a string. The key is determined by appending `_${plural}`. This allows each language to implement arbitrary pluralization.

For convenience, you can leave out the `_one` suffix. The main key will be used for that plural form by default. Note that that is not correct for all languages—make sure to write the `_one` suffix in that case. If a key with the `_one` suffix exists, it is preferred over a suffixless key.

Also for convenience, the `_other` suffix is aliased as `_plural`.

The English pluralization for example returns either "one" or "other". Because of those two conveniences, you can do:

```js
({
  duck: '{{count}} duck',
  duck_plural: '{{count}} ducks'
})
```

instead of:

```js
({
  duck_one: '{{count}} duck',
  duck_other: '{{count}} ducks'
})
```

## API

### `translator = new Translator(lang, options)`

Create a translator instance.

**Parameters**

 - `lang` - An object mapping key IDs to translated strings.

   ```js
    new Translator({ login: 'Log in', register: 'Register' });
   ```

 - `options` - Options for this instance.
   - `options.plural` - A pluralization function for the current language, mapping a cardinal number `n` to one of 'zero', 'one', 'two', 'few', 'many', 'other', or some other value representing the plural form. The default function works for English (and many other languages).
   - `options.default` - A default Translator instance to use if a string is missing. You can use this to fall back to eg. English if another language is incomplete.

### `translator.t(key, data)`

Get the translated string for `key` interpolated with the values in the `data` object.

If `key` is an array, the first available key in the list is used.

### `translator.parts(key, data)`

Get an array containing the literal parts of the translated string for `key`, alternating with the values in the `data` object. This allows using non-string `data` values.

```js
const el = document.createElement('strong')
el.textContent = 'Your Name'

const result = new Translator({ name: 'Name: {{name}}' })
  .parts('name', { name: el })

result.forEach((part) => {
  if (typeof part === 'string') {
    part = document.createTextNode(part)
  }
  document.body.appendChild(par)
})
```

## Related

- [i18next](https://i18next.com) inspired this package, especially the resource and interpolation format.
- [nanotranslate](https://github.com/ajoslin/nanotranslate) is another very small translation library, but its pluralization support is not suited for all languages.
- [make-plural](https://github.com/eemeli/make-plural) is used to generate the pluralization functions.

## License

[MIT][license]

[license]: ./LICENSE
