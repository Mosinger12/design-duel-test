#!/usr/bin/env node
/**
 * Lizenz-BERICHT (nur zur Information): liest die Lizenz JEDES Pakets in node_modules
 * (rekursiv, inkl. Build- und Test-Werkzeuge) aus dessen package.json.
 *
 * Maßgeblich ist laut Entscheidung des Inhabers (PROJEKT.md E-04, Option A) nur, was in
 * der App landet -> geprüft von scripts/license-check.js. Dieser Bericht zeigt zusätzlich,
 * welche Werkzeuge andere Lizenzen haben, und bricht NICHT ab.
 *
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { isAllowed, normalizeLicense } = require('./license-rules');
const JSON_OUT = process.argv.includes('--json'); // --list: Markdown-Tabelle aller Pakete

function collectPackages() {
  const found = new Map(); // key name@version -> {name, version, license, dirs[]}
  function scanNodeModules(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      if (entry.startsWith('.')) continue;
      const full = path.join(dir, entry);
      if (entry.startsWith('@')) {
        for (const sub of fs.readdirSync(full)) scanPackage(path.join(full, sub));
      } else {
        scanPackage(full);
      }
    }
  }
  function scanPackage(dir) {
    let stat;
    try { stat = fs.lstatSync(dir); } catch { return; }
    if (!stat.isDirectory()) return;
    const pj = path.join(dir, 'package.json');
    if (fs.existsSync(pj)) {
      let pkg;
      try { pkg = JSON.parse(fs.readFileSync(pj, 'utf8')); } catch { pkg = null; }
      if (pkg && pkg.name) {
        const key = pkg.name + '@' + pkg.version;
        const rel = path.relative(ROOT, dir);
        if (!found.has(key)) found.set(key, { name: pkg.name, version: pkg.version, license: normalizeLicense(pkg), dirs: [rel] });
        else found.get(key).dirs.push(rel);
      } else if (!pkg) {
        found.set('UNREADABLE:' + dir, { name: path.relative(ROOT, dir), version: '?', license: '', dirs: [dir], unreadable: true });
      }
    }
    scanNodeModules(path.join(dir, 'node_modules'));
  }
  scanNodeModules(path.join(ROOT, 'node_modules'));
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function main() {
  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) {
    console.error('FEHLER: node_modules fehlt. Bitte zuerst "npm install" ausführen.');
    process.exit(1);
  }
  const pkgs = collectPackages();
  const ok = [], bad = [];
  for (const p of pkgs) {
    if (p.license && isAllowed(p.license)) ok.push(p);
    else bad.push(p);
  }
  if (JSON_OUT) {
    console.log(JSON.stringify({ ok, bad }, null, 2));
    // exitCode statt exit(): große Ausgabe wird vollständig geschrieben
    return;
  }
  if (process.argv.includes('--list')) {
    for (const p of pkgs) console.log(`| ${p.name} | ${p.version} | ${p.license || 'KEINE ANGABE'} | ${isAllowed(p.license) ? 'ja' : 'NEIN'} |`);
    return;
  }
  const counts = {};
  for (const p of ok) counts[p.license] = (counts[p.license] || 0) + 1;
  console.log(`Geprüfte Pakete: ${pkgs.length}`);
  console.log('Erlaubte Lizenzen:', Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', '));
  if (bad.length) {
    console.log(`\nHINWEIS: ${bad.length} Paket(e) außerhalb der Erlaubt-Liste. Das ist nur ein Problem, wenn eines davon in der App landet -> "npm run license-check" prüft genau das.`);
    for (const p of bad) console.log(`  - ${p.name}@${p.version} [${p.license || 'KEINE ANGABE'}] (${p.dirs[0]})`);
    return;
  }
  console.log('\nAlle installierten Pakete haben eine erlaubte Lizenz.');
}

if (require.main === module) main();
module.exports = { collectPackages };
