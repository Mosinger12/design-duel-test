#!/usr/bin/env node
/**
 * Lizenz-Prüfung: liest die Lizenz JEDES Pakets in node_modules (rekursiv,
 * inkl. verschachtelter node_modules und @scope-Ordner) aus dessen package.json.
 *
 * Erlaubt: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD.
 * SPDX-Ausdrücke: "A OR B" ist ok, wenn mindestens eine Seite erlaubt ist;
 * "A AND B" ist ok, wenn alle Seiten erlaubt sind.
 *
 * Es gibt KEINE Ausnahmen. (Ob Build-/Test-Werkzeuge ausgenommen werden dürfen,
 * ist eine offene Entscheidung des Projektinhabers, siehe PROJEKT.md, Offene Punkte.)
 *
 * Exit-Code 1 bei jedem nicht erlaubten, fehlenden oder unlesbaren Eintrag.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ALLOWED = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD']);
const JSON_OUT = process.argv.includes('--json'); // --list: Markdown-Tabelle aller Pakete

function normalizeLicense(pkg) {
  let lic = pkg.license;
  if (lic && typeof lic === 'object') lic = lic.type;
  if (!lic && Array.isArray(pkg.licenses)) {
    const types = pkg.licenses.map((l) => (typeof l === 'string' ? l : l && l.type)).filter(Boolean);
    if (types.length) lic = types.length === 1 ? types[0] : '(' + types.join(' OR ') + ')';
  }
  return typeof lic === 'string' ? lic.trim() : '';
}

/** Minimaler SPDX-Auswerter für OR/AND/Klammern. */
function isAllowed(expr) {
  const tokens = expr.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').split(/\s+/).filter(Boolean);
  let i = 0;
  function parseOr() {
    let v = parseAnd();
    while (tokens[i] && tokens[i].toUpperCase() === 'OR') { i++; const r = parseAnd(); v = v || r; }
    return v;
  }
  function parseAnd() {
    let v = parseAtom();
    while (tokens[i] && tokens[i].toUpperCase() === 'AND') { i++; const r = parseAtom(); v = v && r; }
    return v;
  }
  function parseAtom() {
    const t = tokens[i++];
    if (t === '(') { const v = parseOr(); i++; return v; }
    if (!t) return false;
    // "WITH"-Ausnahmen (z. B. Apache-2.0 WITH LLVM-exception) gelten als nicht automatisch erlaubt
    if (tokens[i] && tokens[i].toUpperCase() === 'WITH') { i += 2; return false; }
    return ALLOWED.has(t);
  }
  try { const v = parseOr(); return i >= tokens.length && v; } catch { return false; }
}

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
    process.exitCode = bad.length ? 1 : 0; // exitCode statt exit(): große Ausgabe wird vollständig geschrieben
    return;
  }
  if (process.argv.includes('--list')) {
    for (const p of pkgs) console.log(`| ${p.name} | ${p.version} | ${p.license || 'KEINE ANGABE'} | ${isAllowed(p.license) ? 'ja' : 'NEIN'} |`);
    process.exitCode = bad.length ? 1 : 0;
    return;
  }
  const counts = {};
  for (const p of ok) counts[p.license] = (counts[p.license] || 0) + 1;
  console.log(`Geprüfte Pakete: ${pkgs.length}`);
  console.log('Erlaubte Lizenzen:', Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', '));
  if (bad.length) {
    console.error(`\nFEHLER: ${bad.length} Paket(e) mit nicht erlaubter oder fehlender Lizenz:`);
    for (const p of bad) console.error(`  x ${p.name}@${p.version} [${p.license || 'KEINE ANGABE'}] (${p.dirs[0]})`);
    process.exit(1);
  }
  console.log('\nOK: alle Lizenzen erlaubt.');
}

if (require.main === module) main();
module.exports = { isAllowed, normalizeLicense, collectPackages };
