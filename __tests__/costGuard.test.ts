import { costGuard, createCostGuard, DEFAULT_DAILY_QUOTA } from '../src/config/costGuard';
import { resetFlags, setFlag } from '../src/config/featureFlags';

afterEach(() => resetFlags());

describe('costGuard', () => {
  it('Standard-Tageskontingent ist 0 – keine bezahlte Aktion möglich', () => {
    expect(DEFAULT_DAILY_QUOTA).toBe(0);
    for (const a of ['liveRender', 'cloudSave', 'remoteContent'] as const) {
      expect(costGuard.quota(a)).toBe(0);
      expect(costGuard.canSpend(a)).toBe(false);
      expect(costGuard.trySpend(a)).toBe(false);
    }
  });

  it('Kontingent wird eingehalten und am nächsten Tag zurückgesetzt', () => {
    let now = new Date(2026, 10, 18, 10);
    const g = createCostGuard({ dailyQuota: { liveRender: 2 }, now: () => now });
    expect(g.trySpend('liveRender')).toBe(true);
    expect(g.trySpend('liveRender')).toBe(true);
    expect(g.trySpend('liveRender')).toBe(false);
    expect(g.remaining('liveRender')).toBe(0);
    now = new Date(2026, 10, 19, 0, 1);
    expect(g.remaining('liveRender')).toBe(2);
  });

  it('ungültige Kontingente (negativ, NaN) zählen als 0', () => {
    const g = createCostGuard({ dailyQuota: { liveRender: -5, cloudSave: Number.NaN } });
    expect(g.canSpend('liveRender')).toBe(false);
    expect(g.canSpend('cloudSave')).toBe(false);
  });

  it('guarded(): läuft nur mit Schalter AN und freiem Kontingent', () => {
    const g = createCostGuard({ dailyQuota: { liveRender: 1 } });
    const fn = jest.fn(() => 'ok');
    expect(g.guarded('liveRender', 'liveRender', fn)).toEqual({ ran: false, reason: 'flagOff' });
    expect(fn).not.toHaveBeenCalled();
    setFlag('liveRender', true);
    expect(g.guarded('liveRender', 'liveRender', fn)).toEqual({ ran: true, value: 'ok' });
    expect(g.guarded('liveRender', 'liveRender', fn)).toEqual({ ran: false, reason: 'quotaExhausted' });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('mit Standard-Kostenschutz läuft selbst bei Schalter AN nichts', () => {
    setFlag('liveRender', true);
    expect(costGuard.guarded('liveRender', 'liveRender', () => 1)).toEqual({ ran: false, reason: 'quotaExhausted' });
  });
});
