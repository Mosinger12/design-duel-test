/**
 * Mini-i18n ohne Fremdbibliothek. Alle Texte liegen in JSON:
 *  - App-Texte: src/i18n/locales/<sprache>.json
 *  - Thementexte: themes/<name>/i18n/<sprache>.json
 * Startsprache: Englisch. Deutsch ist vorbereitet.
 */
import type { Dictionary, TextParam, Theme } from '../engine/types';

export const LANGUAGES = ['en', 'de'] as const;
export type Lang = (typeof LANGUAGES)[number];
export const DEFAULT_LANG: Lang = 'en';

export const APP_TEXTS: Record<Lang, Dictionary> = {
  en: require('./locales/en.json'),
  de: require('./locales/de.json'),
};

export type TFunction = (key: string, params?: Record<string, TextParam>) => string;

export function createT(lang: Lang, theme?: Theme): TFunction {
  const dict: Dictionary = { ...APP_TEXTS.en, ...(theme?.i18n.en ?? {}), ...APP_TEXTS[lang], ...(theme?.i18n[lang] ?? {}) };
  const t: TFunction = (key, params) => {
    let s = dict[key];
    if (s === undefined) return key; // fehlender Text bleibt sichtbar (Tests verhindern das)
    if (params) {
      s = s.replace(/\{(\w+)\}/g, (_, name: string) => {
        const v = params[name];
        if (v === undefined) return `{${name}}`;
        if (typeof v === 'object') return t(v.t);
        return String(v);
      });
    }
    return s;
  };
  return t;
}

export function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
