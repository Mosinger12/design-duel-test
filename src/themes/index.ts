/**
 * Themen-Register. Neue Themen: Ordner /themes/<name>/ anlegen und hier eintragen.
 * (Metro braucht feste require-Pfade, daher die explizite Liste.)
 */
import type { BlockedSymbol, Brief, Part, RuleDef, Theme, ThemeManifest } from '../engine/types';

function make(manifest: unknown, parts: unknown, briefs: unknown, rules: unknown, en: unknown, de: unknown, blocked?: unknown): Theme {
  return {
    manifest: manifest as ThemeManifest,
    parts: parts as Part[],
    briefs: briefs as Brief[],
    rules: rules as RuleDef[],
    i18n: { en: en as Record<string, string>, de: de as Record<string, string> },
    blockedSymbols: blocked ? (blocked as { symbols: BlockedSymbol[] }).symbols : undefined,
  };
}

export const THEMES: Record<string, Theme> = {
  food: make(
    require('../../themes/food/theme.json'),
    require('../../themes/food/parts.json'),
    require('../../themes/food/briefs.json'),
    require('../../themes/food/rules.json'),
    require('../../themes/food/i18n/en.json'),
    require('../../themes/food/i18n/de.json'),
  ),
  tattoo: make(
    require('../../themes/tattoo/theme.json'),
    require('../../themes/tattoo/parts.json'),
    require('../../themes/tattoo/briefs.json'),
    require('../../themes/tattoo/rules.json'),
    require('../../themes/tattoo/i18n/en.json'),
    require('../../themes/tattoo/i18n/de.json'),
    require('../../themes/tattoo/blocked-symbols.json'),
  ),
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME = 'food';

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES[DEFAULT_THEME];
}

/** Reihenfolge der Slots für die Auswahl in der Oberfläche. */
export function pickOrder(theme: Theme): string[] {
  return theme.manifest.pickOrder ?? theme.manifest.slots.map((s) => s.id);
}
