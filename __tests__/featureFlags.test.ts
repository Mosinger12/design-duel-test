import { applyRemoteFlags, FLAG_DEFAULTS, FLAG_NAMES, getFlags, isEnabled, resetFlags, setFlag } from '../src/config/featureFlags';

afterEach(() => resetFlags());

describe('featureFlags', () => {
  it('kennt genau ads, iap, analytics, liveRender, sponsoredContent', () => {
    expect([...FLAG_NAMES].sort()).toEqual(['ads', 'analytics', 'iap', 'liveRender', 'sponsoredContent']);
  });

  it('alle Schalter sind standardmäßig aus', () => {
    for (const f of FLAG_NAMES) {
      expect(FLAG_DEFAULTS[f]).toBe(false);
      expect(isEnabled(f)).toBe(false);
    }
  });

  it('Standardwerte sind unveränderlich', () => {
    expect(Object.isFrozen(FLAG_DEFAULTS)).toBe(true);
    try { (FLAG_DEFAULTS as Record<string, boolean>).ads = true; } catch { /* erwartet im strict mode */ }
    expect(FLAG_DEFAULTS.ads).toBe(false);
  });

  it('setFlag und resetFlags', () => {
    setFlag('sponsoredContent', true);
    expect(isEnabled('sponsoredContent')).toBe(true);
    resetFlags();
    expect(isEnabled('sponsoredContent')).toBe(false);
  });

  it('applyRemoteFlags akzeptiert nur bekannte Schalter mit true/false', () => {
    const f = applyRemoteFlags({ ads: 'yes', iap: 1, analytics: null, unknown: true, liveRender: true });
    expect(f.ads).toBe(false);
    expect(f.iap).toBe(false);
    expect(f.analytics).toBe(false);
    expect(f.liveRender).toBe(true);
    expect('unknown' in getFlags()).toBe(false);
  });

  it('ungültige Fernschalter-Daten ändern nichts', () => {
    for (const bad of [null, undefined, 'x', 42, [true]]) expect(applyRemoteFlags(bad)).toEqual(FLAG_DEFAULTS);
  });
});
