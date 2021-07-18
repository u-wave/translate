import Translator from '.'

const { t } = new Translator({
  some: { key: 'abc {{def}}' }
})

t('some.key', { def: 'def' }) === 'abc def'
const result = new Translator({
  some: { key: 'abc {{def}}' }
}).parts(['somekey', 'some.key'], { def: 'def' })
if (result) {
  const [a, b] = result
  a === 'abc '
  b === 'def'
}
