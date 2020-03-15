# @u-wave/translate change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 1.1.0
* Update dependencies.
* Mark the package as side-effect-free.
* Add support for fallback messages by passing an array:
  ```js
  translator.t(['path.to.key', 'path.to.fallback.key'])
  ```
  The first key that has a value will be used.

## 1.0.0
* Initial release.
