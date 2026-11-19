/**
 * Gemeinsame Lizenz-Regeln für license-check.js und license-report.js.
 * Erlaubt: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD.
 * SPDX-Ausdrücke: "A OR B" ist ok, wenn eine Seite erlaubt ist; "A AND B", wenn alle erlaubt sind.
 */
const ALLOWED = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', '0BSD']);

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

module.exports = { ALLOWED, isAllowed, normalizeLicense };
