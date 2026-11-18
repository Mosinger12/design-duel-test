#!/usr/bin/env node
/**
 * Strenge Prüfung dessen, was WIRKLICH in der App landet:
 * Baut die Exporte für Web UND iOS mit Source-Maps (Ordner .bundle-check/), liest daraus alle enthaltenen Pakete aus
 * node_modules und prüft deren Lizenz OHNE Ausnahmen gegen die Erlaubt-Liste
 * (MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD).
 *
 * Aufruf: npm run bundle-license-check   (Option --no-build: vorhandenen Ordner .bundle-check/ nutzen)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { isAllowed, normalizeLicense } = require('./license-check');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, '.bundle-check');

if (!process.argv.includes('--no-build')) {
  console.log('Baue Exporte (web + ios) mit Source-Maps …');
  const r = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--platform', 'ios', '--source-maps', '--output-dir', '.bundle-check'], {
    cwd: ROOT, stdio: 'inherit', env: { ...process.env, EXPO_NO_TELEMETRY: '1' }, shell: process.platform === 'win32',
  });
  if (r.status !== 0) { console.error('FEHLER: Web-Export fehlgeschlagen.'); process.exit(1); }
}

function findMaps(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? findMaps(p) : p.endsWith('.map') ? [p] : [];
  });
}

const maps = findMaps(DIST);
if (!maps.length) { console.error('FEHLER: keine Source-Maps in .bundle-check/ gefunden.'); process.exit(1); }
console.log('Source-Maps:', maps.map((m) => path.relative(DIST, m)).join(', '));

const pkgDirs = new Set();
for (const m of maps) {
  const map = JSON.parse(fs.readFileSync(m, 'utf8'));
  // Metro erzeugt "indexierte" Source-Maps (sections) mit Pfaden relativ zum Projekt ("/node_modules/…")
  const sources = map.sources ?? (map.sections ?? []).flatMap((sec) => sec.map?.sources ?? []);
  for (const s of sources) {
    const abs = s.startsWith('/node_modules/') || s.startsWith('/src/') ? path.join(ROOT, s) : path.resolve(path.dirname(m), s);
    const norm = abs.split(path.sep).join('/');
    const i = norm.lastIndexOf('/node_modules/');
    if (i < 0) continue;
    const rest = norm.slice(i + '/node_modules/'.length).split('/');
    const name = rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0];
    pkgDirs.add(norm.slice(0, i) + '/node_modules/' + name);
  }
}

const rows = [];
let bad = 0;
for (const dir of [...pkgDirs].sort()) {
  const pj = path.join(dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pj, 'utf8'));
  const lic = normalizeLicense(pkg);
  const ok = !!lic && isAllowed(lic);
  if (!ok) bad++;
  rows.push(`${ok ? '  ok' : '  x '} ${pkg.name}@${pkg.version} [${lic || 'KEINE ANGABE'}]`);
}
console.log(`\nPakete in den App-Bundles (web + ios): ${rows.length}`);
console.log(rows.join('\n'));
if (bad) { console.error(`\nFEHLER: ${bad} Paket(e) im App-Bundle mit nicht erlaubter Lizenz.`); process.exit(1); }
console.log('\nOK: alle im App-Bundle enthaltenen Pakete haben eine erlaubte Lizenz (ohne Ausnahmen).');
