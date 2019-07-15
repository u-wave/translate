import fs from 'fs';
import { basename, dirname } from 'path';
import promisify from 'pify';
import mkdirpCb from 'mkdirp';
import PluralCompiler from 'make-plural-compiler';

const pluralsData = require('cldr-core/supplemental/plurals.json');
const ordinalsData = require('cldr-core/supplemental/ordinals.json');

PluralCompiler.load(pluralsData, ordinalsData);

const mkdirp = promisify(mkdirpCb);
const writeFile = promisify(fs.writeFile);

export default function plurals(output) {
  const seen = new Map();

  function getFile(id) {
    return output.file.replace('[locale]', id);
  }

  function writePlurals(id, mp) {
    const file = getFile(id);
    const fnText = mp.toString();
    let source = output.format === 'es'
      ? `export default ${fnText}`
      : `module.exports = ${fnText}`;
    if (seen.has(fnText)) {
      const specifier = `./${basename(getFile(seen.get(fnText)))}`;

      source = output.format === 'es'
        ? `import pluralize from '${specifier}';\n\nexport default pluralize;`
        : `module.exports = require('${specifier}');`;
    } else {
      seen.set(fnText, id);
    }

    return mkdirp(dirname(file))
      .then(() => writeFile(file, `${source}\n`));
  }

  return {
    buildStart() {
      const locales = Object.keys(pluralsData.supplemental['plurals-type-cardinal']);
      return Promise.all(locales.map(id => (
        writePlurals(id, new PluralCompiler(id).compile())
      ))).then(() => {
        const index = getFile('index');
        return writeFile(index, locales.map((id) => {
          const specifier = `./${basename(getFile(id))}`;

          return output.format === 'es'
            ? `export { default as ${id.replace('-', '_')} } from '${specifier}';`
            : `exports.${id.replace('-', '_')} = require('${specifier}');`;
        }).join('\n'));
      });
    },
  };
}
