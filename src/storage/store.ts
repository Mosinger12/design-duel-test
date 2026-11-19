/**
 * Lokale Speicherung des Fortschritts (übersteht Neustart).
 * Speicher-Adapter ist austauschbar; in der App: AsyncStorage (Gerät) bzw. localStorage (Web).
 * Keine Cloud, kein Netzwerk.
 */
import type { Composition } from '../engine/types';
import { DEFAULT_LANG, LANGUAGES, type Lang } from '../i18n';
import { DEFAULT_THEME, THEME_IDS } from '../themes';

export const STORAGE_KEY = 'designDuel.state.v1';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface CollectionEntry {
  id: string;
  createdAt: string;
  composition: Composition;
  stars: number;
}

export interface Settings {
  themeId: string;
  lang: Lang;
  ageConfirmed: boolean;
  region: string;
}

export interface SavedState {
  version: 1;
  settings: Settings;
  collection: CollectionEntry[];
  /** Beste Sterne je "themeId:briefId". */
  best: Record<string, number>;
}

export function defaultState(): SavedState {
  return {
    version: 1,
    settings: { themeId: DEFAULT_THEME, lang: DEFAULT_LANG, ageConfirmed: false, region: 'DE' },
    collection: [],
    best: {},
  };
}

/** Prüft geladene Daten; Unbrauchbares wird durch Standardwerte ersetzt. */
export function sanitize(raw: unknown): SavedState {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<SavedState>;
  const s = (r.settings ?? {}) as Partial<Settings>;
  return {
    version: 1,
    settings: {
      themeId: typeof s.themeId === 'string' && THEME_IDS.includes(s.themeId) ? s.themeId : d.settings.themeId,
      lang: typeof s.lang === 'string' && (LANGUAGES as readonly string[]).includes(s.lang) ? (s.lang as Lang) : d.settings.lang,
      ageConfirmed: s.ageConfirmed === true,
      region: typeof s.region === 'string' ? s.region : d.settings.region,
    },
    collection: Array.isArray(r.collection)
      ? r.collection.filter((e): e is CollectionEntry => !!e && typeof e === 'object' && typeof (e as CollectionEntry).id === 'string' && !!(e as CollectionEntry).composition)
      : [],
    best: r.best && typeof r.best === 'object' ? Object.fromEntries(Object.entries(r.best).filter(([, v]) => typeof v === 'number')) : {},
  };
}

export async function loadState(storage: StorageAdapter): Promise<SavedState> {
  try {
    const txt = await storage.getItem(STORAGE_KEY);
    return txt ? sanitize(JSON.parse(txt)) : defaultState();
  } catch {
    return defaultState();
  }
}

export async function saveState(storage: StorageAdapter, state: SavedState): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(storage: StorageAdapter): Promise<void> {
  await storage.removeItem(STORAGE_KEY);
}

/** Fügt einen Entwurf zur Sammlung hinzu und merkt sich die beste Wertung. */
export function addToCollection(state: SavedState, composition: Composition, stars: number, now: Date = new Date()): SavedState {
  const id = `${now.getTime().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  const key = `${composition.themeId}:${composition.briefId}`;
  return {
    ...state,
    collection: [{ id, createdAt: now.toISOString(), composition, stars }, ...state.collection],
    best: { ...state.best, [key]: Math.max(stars, state.best[key] ?? 0) },
  };
}
