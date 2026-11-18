/**
 * Sichtbarkeit von Aufträgen und Teilen (Sponsoring, Zeitraum, Region, Alter)
 * und Pflicht-Kennzeichnung für gesponserte Inhalte.
 */
import type { CommercialFields, Tier } from './types';
import type { Flags } from '../config/featureFlags';

export interface VisibilityContext {
  flags: Pick<Flags, 'sponsoredContent'>;
  now: Date;
  /** ISO-3166 Ländercode des Nutzers, z. B. "DE". */
  region?: string;
  /** Bestätigtes Alter (z. B. 18 nach Alters-Bestätigung). */
  age?: number;
}

export function isSponsored(item: CommercialFields): boolean {
  return typeof item.sponsor === 'string' && item.sponsor.trim().length > 0;
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isVisible(item: CommercialFields, ctx: VisibilityContext): boolean {
  if (isSponsored(item) && ctx.flags.sponsoredContent !== true) return false;
  // Label ohne Sponsor ist ungültig -> nie anzeigen (verhindert verdeckte Werbung)
  if (item.label && !isSponsored(item)) return false;
  const today = isoDay(ctx.now);
  if (item.validFrom && today < item.validFrom) return false;
  if (item.validTo && today > item.validTo) return false;
  if (item.region) {
    const regions = (Array.isArray(item.region) ? item.region : [item.region]).map((r) => r.toUpperCase());
    if (!ctx.region || !regions.includes(ctx.region.toUpperCase())) return false;
  }
  if (typeof item.minAge === 'number') {
    if (typeof ctx.age !== 'number' || ctx.age < item.minAge) return false;
  }
  return true;
}

export function filterVisible<T extends CommercialFields>(items: T[], ctx: VisibilityContext): T[] {
  return items.filter((i) => isVisible(i, ctx));
}

export type Badge =
  | { kind: 'sponsored'; textKey: 'common.sponsored'; sponsor: string; label?: string }
  | { kind: 'premium'; textKey: 'common.premium' };

/**
 * Kennzeichnungen für die Anzeige. Gesponserte Inhalte bekommen IMMER das Abzeichen
 * "Sponsored" (Text kommt aus common.sponsored und wird nicht vom Sponsor bestimmt).
 */
export function badgesFor(item: CommercialFields & { tier?: Tier }): Badge[] {
  const out: Badge[] = [];
  if (isSponsored(item)) out.push({ kind: 'sponsored', textKey: 'common.sponsored', sponsor: item.sponsor!.trim(), label: item.label });
  if (item.tier === 'premium') out.push({ kind: 'premium', textKey: 'common.premium' });
  return out;
}
