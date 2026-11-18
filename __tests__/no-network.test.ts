/**
 * Kostenschutz/Datenschutz: keine Netzwerk-Aufrufe im App-Code, keine Werbe- oder Analyse-SDKs.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

describe('Keine Netzwerk-Aufrufe', () => {
  const files = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'themes')), path.join(ROOT, 'App.tsx'), path.join(ROOT, 'index.ts')];

  it.each(files.map((f) => path.relative(ROOT, f)))('%s enthält keine Netzwerk-APIs oder URLs', (rel) => {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const banned = /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|axios|https?:\/\/|expo-updates|expo-notifications/;
    expect(code.match(banned)?.[0] ?? null).toBeNull();
  });
});

describe('Keine Werbe-, Analyse- oder Tracking-SDKs', () => {
  const banned = [
    /firebase/i, /analytics/i, /admob/i, /google-mobile-ads/i, /\bads?\b/i, /appsflyer/i, /adjust/i, /amplitude/i,
    /mixpanel/i, /segment/i, /sentry/i, /bugsnag/i, /fbsdk/i, /facebook/i, /branch/i, /tracking-transparency/i,
    /expo-updates/i, /expo-insights/i, /onesignal/i, /revenuecat|react-native-purchases|expo-in-app-purchases|react-native-iap/i,
  ];
  it('package.json enthält keine solchen Abhängigkeiten', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const hits = deps.filter((d) => banned.some((b) => b.test(d)));
    expect(hits).toEqual([]);
  });
  it('auch keine indirekt installierten Werbe-/Analyse-SDKs (package-lock.json)', () => {
    const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
    const names = Object.keys(lock.packages ?? {}).map((p) => p.replace(/^.*node_modules\//, '')).filter(Boolean);
    const sdk = [/^firebase$/, /^@react-native-firebase\//, /google-mobile-ads/, /admob/, /^@segment\//, /mixpanel/, /amplitude/, /^@sentry\//, /appsflyer/, /fbsdk/, /^expo-updates$/, /^expo-insights$/, /onesignal/, /react-native-purchases/, /react-native-iap/];
    expect(names.filter((n) => sdk.some((s) => s.test(n)))).toEqual([]);
  });
});
