/**
 * Zwei "Film-Filter" als reine 2D-Überlagerungen (Tönung, Vignette, Korn).
 * Keine KI, keine Bildbearbeitung zur Laufzeit – nur zusätzliche Ebenen.
 */
export interface FilterSpec {
  id: string;
  tint?: { color: string; opacity: number };
  haze?: { color: string; opacity: number };
  vignette?: { color: string; opacity: number };
  grain?: { count: number; opacity: number; light: string; dark: string };
}

export const FILTERS: Record<string, FilterSpec> = {
  none: { id: 'none' },
  golden: {
    id: 'golden',
    tint: { color: '#FFB050', opacity: 0.16 },
    vignette: { color: '#3A1E00', opacity: 0.45 },
    grain: { count: 260, opacity: 0.08, light: '#FFF4E0', dark: '#2A1600' },
  },
  silver: {
    id: 'silver',
    tint: { color: '#7F93A8', opacity: 0.14 },
    haze: { color: '#F2F5F8', opacity: 0.16 },
    vignette: { color: '#0E1620', opacity: 0.4 },
    grain: { count: 420, opacity: 0.12, light: '#FFFFFF', dark: '#000000' },
  },
};

export const FILTER_IDS = Object.keys(FILTERS);

export function getFilter(id: string): FilterSpec {
  return FILTERS[id] ?? FILTERS.none;
}
