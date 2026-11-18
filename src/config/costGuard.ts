/**
 * Kostenschutz: Tageskontingent für kostenpflichtige Aktionen.
 * Standard-Kontingent ist 0 – ohne bewusste Freigabe ist also KEINE bezahlte Aktion möglich.
 * Zusätzlich muss (über guarded()) der passende Fernschalter an sein.
 */
import { isEnabled, type FlagName } from './featureFlags';

export type PaidAction = 'liveRender' | 'cloudSave' | 'remoteContent';

export interface CostGuardOptions {
  /** Tageskontingent je Aktion. Fehlt eine Aktion, gilt 0. */
  dailyQuota?: Partial<Record<PaidAction, number>>;
  /** Uhr (für Tests austauschbar). */
  now?: () => Date;
}

export interface CostGuard {
  quota(action: PaidAction): number;
  used(action: PaidAction): number;
  remaining(action: PaidAction): number;
  canSpend(action: PaidAction): boolean;
  /** Bucht eine Einheit, wenn möglich. Gibt false zurück, wenn das Kontingent erschöpft ist. */
  trySpend(action: PaidAction): boolean;
  /** Führt fn nur aus, wenn Schalter an UND Kontingent frei ist. */
  guarded<T>(flag: FlagName, action: PaidAction, fn: () => T): { ran: true; value: T } | { ran: false; reason: 'flagOff' | 'quotaExhausted' };
}

export const DEFAULT_DAILY_QUOTA = 0;

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function createCostGuard(opts: CostGuardOptions = {}): CostGuard {
  const now = opts.now ?? (() => new Date());
  const quotas = opts.dailyQuota ?? {};
  let currentDay = dayKey(now());
  let usage: Partial<Record<PaidAction, number>> = {};

  function rollover() {
    const k = dayKey(now());
    if (k !== currentDay) { currentDay = k; usage = {}; }
  }
  const quota = (a: PaidAction) => {
    const q = quotas[a];
    return typeof q === 'number' && Number.isFinite(q) && q > 0 ? Math.floor(q) : DEFAULT_DAILY_QUOTA;
  };
  const used = (a: PaidAction) => { rollover(); return usage[a] ?? 0; };
  const remaining = (a: PaidAction) => Math.max(0, quota(a) - used(a));
  const canSpend = (a: PaidAction) => remaining(a) > 0;
  const trySpend = (a: PaidAction) => {
    if (!canSpend(a)) return false;
    usage = { ...usage, [a]: used(a) + 1 };
    return true;
  };
  return {
    quota, used, remaining, canSpend, trySpend,
    guarded(flag, action, fn) {
      if (!isEnabled(flag)) return { ran: false, reason: 'flagOff' };
      if (!trySpend(action)) return { ran: false, reason: 'quotaExhausted' };
      return { ran: true, value: fn() };
    },
  };
}

/** App-weiter Kostenschutz mit Standardwerten (alles 0). */
export const costGuard = createCostGuard();
