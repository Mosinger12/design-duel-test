import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFlags, subscribeFlags, type Flags } from '../config/featureFlags';
import type { Theme } from '../engine/types';
import type { VisibilityContext } from '../engine/visibility';
import { createT, type TFunction } from '../i18n';
import { defaultState, loadState, saveState, type SavedState, type StorageAdapter } from '../storage/store';
import { getTheme } from '../themes';

interface AppCtx {
  ready: boolean;
  state: SavedState;
  update: (fn: (s: SavedState) => SavedState) => void;
  theme: Theme;
  t: TFunction;
  flags: Flags;
  visibility: VisibilityContext;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children, storage = AsyncStorage as StorageAdapter }: { children: React.ReactNode; storage?: StorageAdapter }) {
  const [state, setState] = useState<SavedState>(defaultState);
  const [ready, setReady] = useState(false);
  const [flags, setFlags] = useState<Flags>(getFlags);
  const loaded = useRef(false);

  useEffect(() => subscribeFlags(() => setFlags(getFlags())), []);

  useEffect(() => {
    let alive = true;
    loadState(storage).then((s) => {
      if (!alive) return;
      loaded.current = true;
      setState(s);
      setReady(true);
    });
    return () => { alive = false; };
  }, [storage]);

  useEffect(() => {
    if (loaded.current) saveState(storage, state).catch(() => undefined);
  }, [state, storage]);

  const update = useCallback((fn: (s: SavedState) => SavedState) => setState(fn), []);
  const theme = getTheme(state.settings.themeId);
  const t = useMemo(() => createT(state.settings.lang, theme), [state.settings.lang, theme]);
  const visibility = useMemo<VisibilityContext>(
    () => ({ flags, now: new Date(), region: state.settings.region, age: state.settings.ageConfirmed ? 18 : undefined }),
    [flags, state.settings.region, state.settings.ageConfirmed],
  );

  return <Ctx.Provider value={{ ready, state, update, theme, t, flags, visibility }}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp außerhalb von AppProvider');
  return c;
}
