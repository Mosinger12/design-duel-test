/** Selbsttest der Lizenz-Logik von scripts/license-check.js (nicht der Lauf über node_modules). */
const { isAllowed, normalizeLicense } = require('../scripts/license-check');

describe('license-check: Lizenz-Auswertung', () => {
  it.each(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD'])('%s ist erlaubt', (l) => expect(isAllowed(l)).toBe(true));
  it.each(['GPL-3.0', 'MPL-2.0', 'CC-BY-4.0', 'BlueOak-1.0.0', 'Unlicense', 'UNLICENSED', 'SEE LICENSE IN LICENSE', ''])('%s ist nicht erlaubt', (l) => expect(isAllowed(l)).toBe(false));
  it('OR: erlaubt, wenn eine Seite erlaubt ist; AND: nur wenn alle erlaubt sind', () => {
    expect(isAllowed('(MIT OR GPL-3.0)')).toBe(true);
    expect(isAllowed('(MIT AND GPL-3.0)')).toBe(false);
    expect(isAllowed('(MIT AND ISC)')).toBe(true);
    expect(isAllowed('Apache-2.0 WITH LLVM-exception')).toBe(false);
  });
  it('liest alte Formate (license-Objekt, licenses-Liste)', () => {
    expect(normalizeLicense({ license: { type: 'MIT' } })).toBe('MIT');
    expect(normalizeLicense({ licenses: [{ type: 'MIT' }, { type: 'Apache-2.0' }] })).toBe('(MIT OR Apache-2.0)');
    expect(normalizeLicense({})).toBe('');
  });
});
