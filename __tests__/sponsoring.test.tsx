/**
 * Sponsoring: ohne Schalter kein gesponserter Inhalt; mit Schalter nie ohne Kennzeichnung.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FLAG_DEFAULTS } from '../src/config/featureFlags';
import { badgesFor, filterVisible, isSponsored, isVisible, type VisibilityContext } from '../src/engine/visibility';
import { createT } from '../src/i18n';
import { THEMES } from '../src/themes';
import { Badges } from '../src/ui/components/Badges';
import { BriefInfo } from '../src/ui/components/BriefInfo';
import { PartChip } from '../src/ui/components/PartChip';

const NOW = new Date('2026-11-18T12:00:00Z');
const off: VisibilityContext = { flags: { sponsoredContent: FLAG_DEFAULTS.sponsoredContent }, now: NOW, region: 'DE', age: 18 };
const on: VisibilityContext = { ...off, flags: { sponsoredContent: true } };

describe('Sponsoring', () => {
  it('Standard: Schalter sponsoredContent ist aus', async () => {
    expect(FLAG_DEFAULTS.sponsoredContent).toBe(false);
  });

  it('Testdaten enthalten gesponserte Einträge (sonst wäre der Test wertlos)', async () => {
    const all = Object.values(THEMES).flatMap((t) => [...t.briefs, ...t.parts]);
    expect(all.filter(isSponsored).length).toBeGreaterThanOrEqual(2);
  });

  it.each(Object.keys(THEMES))('ohne Schalter: kein gesponserter Auftrag/Teil sichtbar (%s)', (id) => {
    const t = THEMES[id];
    for (const item of [...filterVisible(t.briefs, off), ...filterVisible(t.parts, off)]) {
      expect(isSponsored(item)).toBe(false);
      expect(item.label).toBeUndefined();
    }
  });

  it.each(Object.keys(THEMES))('mit Schalter: jeder sichtbare gesponserte Eintrag trägt das Abzeichen "Sponsored" (%s)', (id) => {
    const t = THEMES[id];
    const visible = [...filterVisible(t.briefs, on), ...filterVisible(t.parts, on)].filter(isSponsored);
    expect(visible.length).toBeGreaterThan(0);
    for (const item of visible) {
      const b = badgesFor(item);
      expect(b.some((x) => x.kind === 'sponsored' && x.textKey === 'common.sponsored')).toBe(true);
    }
  });

  it('Label ohne Sponsor wird nie angezeigt (keine verdeckte Werbung)', async () => {
    expect(isVisible({ label: 'Top pick' }, on)).toBe(false);
  });

  it('Zeitraum, Region und Mindestalter werden beachtet', async () => {
    const item = { sponsor: 'X', validFrom: '2026-12-01', validTo: '2026-12-31', region: ['AT'], minAge: 21 };
    expect(isVisible(item, on)).toBe(false);
    expect(isVisible({ ...item, validFrom: undefined }, on)).toBe(false); // Region AT ≠ DE
    expect(isVisible({ sponsor: 'X', validTo: '2026-01-01' }, on)).toBe(false);
    expect(isVisible({ sponsor: 'X', minAge: 21 }, on)).toBe(false);
    expect(isVisible({ sponsor: 'X', region: 'de' }, on)).toBe(true);
    expect(isVisible({ minAge: 18 }, { ...off, age: undefined })).toBe(false);
  });

  describe.each(['en', 'de'] as const)('Darstellung (%s)', (lang) => {
    it('Abzeichen-Text enthält "Sponsored"', async () => {
      expect(createT(lang)('common.sponsored')).toContain('Sponsored');
    });

    it.each(Object.keys(THEMES))('jedes gesponserte Teil zeigt "Sponsored" in der Auswahl (%s)', async (id) => {
      const theme = THEMES[id];
      const t = createT(lang, theme);
      for (const part of filterVisible(theme.parts, on).filter(isSponsored)) {
        await render(<PartChip part={part} selected={false} locked={false} onPress={() => {}} t={t} vars={{}} />);
        expect(screen.getByTestId('badge-sponsored')).toBeTruthy();
        expect(screen.getByText(new RegExp(t('common.sponsored').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeTruthy();
        await screen.unmount();
      }
    });

    it.each(Object.keys(THEMES))('jeder gesponserte Auftrag zeigt "Sponsored" (%s)', async (id) => {
      const theme = THEMES[id];
      const t = createT(lang, theme);
      for (const brief of filterVisible(theme.briefs, on).filter(isSponsored)) {
        await render(<BriefInfo brief={brief} theme={theme} t={t} />);
        expect(screen.getByTestId('badge-sponsored')).toBeTruthy();
        await screen.unmount();
      }
    });

    it('Sponsor-Label ersetzt die Kennzeichnung nicht', async () => {
      const t = createT(lang);
      await render(<Badges item={{ sponsor: 'Demo', label: 'Best choice' }} t={t} />);
      expect(screen.getByText(t('common.sponsored'))).toBeTruthy();
    });

    it('nicht gesponserte Teile haben kein Sponsored-Abzeichen', async () => {
      const t = createT(lang);
      await render(<Badges item={{ tier: 'free' }} t={t} />);
      expect(screen.queryByTestId('badge-sponsored')).toBeNull();
    });
  });
});
