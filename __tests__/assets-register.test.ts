/**
 * Rechte: Jede Datei in /assets braucht einen vollständigen Eintrag in /assets/REGISTER.json.
 */
import fs from 'fs';
import path from 'path';

const ASSETS = path.join(__dirname, '..', 'assets');
const register = JSON.parse(fs.readFileSync(path.join(ASSETS, 'REGISTER.json'), 'utf8'));

function listFiles(dir: string, base = ''): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(path.join(dir, e.name), path.join(base, e.name)) : [path.join(base, e.name).split(path.sep).join('/')]);
}

describe('Asset-Register', () => {
  const files = listFiles(ASSETS).filter((f) => f !== 'REGISTER.json' && !f.endsWith('.DS_Store'));
  const entries: Record<string, string>[] = register.entries;

  it.each(files)('Datei %s hat einen Eintrag', (f) => {
    expect(entries.map((e) => e.file)).toContain(f);
  });

  it('jeder Eintrag hat Quelle, Lizenz, Datum und Ersteller/Prompt', () => {
    for (const e of entries) {
      for (const k of ['file', 'source', 'license', 'date', 'creator']) expect({ file: e.file, k, ok: typeof e[k] === 'string' && e[k].trim().length > 0 }).toEqual({ file: e.file, k, ok: true });
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof e.prompt).toBe('string');
    }
  });

  it('kein Eintrag verweist auf eine nicht vorhandene Datei', () => {
    for (const e of entries) expect(files).toContain(e.file);
  });
});
