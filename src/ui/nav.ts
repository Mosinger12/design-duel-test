import type { Composition } from '../engine/types';

export type Route =
  | { name: 'home' }
  | { name: 'briefs' }
  | { name: 'play'; briefId: string; from?: Composition }
  | { name: 'result'; composition: Composition }
  | { name: 'collection' }
  | { name: 'settings' };

export type Nav = (r: Route) => void;
