/**
 * Fernschalter (Feature Flags). Sichere Standardwerte: ALLES AUS.
 *
 * In dieser Phase gibt es KEINEN Netzwerk-Abruf. applyRemoteFlags() ist nur die
 * vorbereitete Schnittstelle für später: Sie nimmt ein bereits geladenes Objekt
 * entgegen, akzeptiert nur bekannte Schalter mit echten true/false-Werten und
 * ignoriert alles andere.
 */
export const FLAG_NAMES = ['ads', 'iap', 'analytics', 'liveRender', 'sponsoredContent'] as const;
export type FlagName = (typeof FLAG_NAMES)[number];
export type Flags = Readonly<Record<FlagName, boolean>>;

export const FLAG_DEFAULTS: Flags = Object.freeze({
  ads: false,
  iap: false,
  analytics: false,
  liveRender: false,
  sponsoredContent: false,
});

let overrides: Partial<Record<FlagName, boolean>> = {};
const listeners = new Set<() => void>();

export function getFlags(): Flags {
  return Object.freeze({ ...FLAG_DEFAULTS, ...overrides });
}

export function isEnabled(name: FlagName): boolean {
  return getFlags()[name] === true;
}

function isFlagName(x: string): x is FlagName {
  return (FLAG_NAMES as readonly string[]).includes(x);
}

/** Lokales Setzen (Tests, Entwickler-Optionen). */
export function setFlag(name: FlagName, value: boolean): void {
  if (!isFlagName(name) || typeof value !== 'boolean') return;
  overrides = { ...overrides, [name]: value };
  listeners.forEach((l) => l());
}

/** Vorbereitet für spätere Fernschalter. Unbekanntes/Ungültiges wird ignoriert. */
export function applyRemoteFlags(input: unknown): Flags {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const next = { ...overrides };
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (isFlagName(k) && typeof v === 'boolean') next[k] = v;
    }
    overrides = next;
    listeners.forEach((l) => l());
  }
  return getFlags();
}

export function resetFlags(): void {
  overrides = {};
  listeners.forEach((l) => l());
}

export function subscribeFlags(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
