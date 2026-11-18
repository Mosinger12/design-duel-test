#!/usr/bin/env node
/**
 * Erzeugt die App-Icons als PNG aus einfachen geometrischen Formen (eigenes Werk,
 * keine Vorlagen, keine Downloads). Nur Node-Bordmittel (zlib).
 * Aufruf: node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.resolve(__dirname, '..', 'assets');

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, shader) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = shader((x + 0.5) / size, (y + 0.5) / size, 1 / size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const cover = (d, px) => Math.max(0, Math.min(1, 0.5 - d / px)); // Kantenglättung

const BG = hex('#C2563A'), CREAM = hex('#F6F3EE'), DARK = hex('#1F1D1A'), GOLD = hex('#E0A526');

/** Abstand zu einem gedrehten, abgerundeten Rechteck (signed distance). */
function card(x, y, cx, cy, w, h, r, deg) {
  const a = (deg * Math.PI) / 180;
  const dx = x - cx, dy = y - cy;
  const lx = Math.abs(dx * Math.cos(a) + dy * Math.sin(a)) - w / 2 + r;
  const ly = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)) - h / 2 + r;
  return Math.hypot(Math.max(lx, 0), Math.max(ly, 0)) + Math.min(Math.max(lx, ly), 0) - r;
}
/** Motiv: zwei gegeneinander gekippte Karten ("Duell") + goldene Raute. */
function cardsMask(x, y, px) {
  return Math.max(cover(card(x, y, 0.38, 0.52, 0.3, 0.42, 0.04, -12), px), cover(card(x, y, 0.62, 0.48, 0.3, 0.42, 0.04, 12), px));
}
function motif(x, y, px, base) {
  let c = base;
  c = mix(c, CREAM, cover(card(x, y, 0.38, 0.52, 0.3, 0.42, 0.04, -12), px));
  c = mix(c, DARK, cover(card(x, y, 0.62, 0.48, 0.3, 0.42, 0.04, 12), px));
  const d3 = Math.abs(x - 0.62) + Math.abs(y - 0.48) - 0.07;
  c = mix(c, GOLD, cover(d3, px));
  return c;
}

const files = {
  'icon.png': [1024, (x, y, px) => [...motif(x, y, px, BG), 255]],
  'favicon.png': [48, (x, y, px) => [...motif(x, y, px, BG), 255]],
  'android-icon-background.png': [512, () => [...BG, 255]],
  'android-icon-foreground.png': [512, (x, y, px) => {
    // nur das Motiv, transparent außen (verkleinert für die sichere Zone)
    const sx = 0.5 + (x - 0.5) / 0.66, sy = 0.5 + (y - 0.5) / 0.66;
    const c = motif(sx, sy, px / 0.66, [0, 0, 0]);
    const inside = cardsMask(sx, sy, px / 0.66);
    return [...c, Math.round(inside * 255)];
  }],
  'android-icon-monochrome.png': [512, (x, y, px) => {
    const sx = 0.5 + (x - 0.5) / 0.66, sy = 0.5 + (y - 0.5) / 0.66;
    const a = cardsMask(sx, sy, px / 0.66);
    return [255, 255, 255, Math.round(a * 255)];
  }],
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, [size, shader]] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), png(size, shader));
  console.log('geschrieben:', path.join('assets', name));
}
