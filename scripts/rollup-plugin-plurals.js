import fs from 'fs';
import { basename, dirname } from 'path';
import PluralCompiler from 'make-plural-compiler';

const pluralsData = require('cldr-core/supplemental/plurals.json');
const ordinalsData = require('cldr-core/supplemental/ordinals.json');

PluralCompiler.load(pluralsData, ordinalsData);

export default function plurals(output) {
  const seen = new Map();

  function getFile(id) {
    return output.file.replace('[locale]', id);
  }

  async function writePlurals(id, mp) {
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

    await fs.promises.mkdir(dirname(file), { recursive: true });
    await fs.promises.writeFile(file, `${source}\n`);
  }

  return {
    async buildStart() {
      const locales = Object.keys(pluralsData.supplemental['plurals-type-cardinal']);
      await Promise.all(locales.map((id) => (
        writePlurals(id, new PluralCompiler(id).compile())
      )));

      const index = getFile('index');
      await fs.promises.writeFile(index, locales.map((id) => {
        const specifier = `./${basename(getFile(id))}`;

        return output.format === 'es'
          ? `export { default as ${id.replace('-', '_')} } from '${specifier}';`
          : `exports.${id.replace('-', '_')} = require('${specifier}');`;
      }).join('\n'));
    },
  };
}
