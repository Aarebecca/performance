import type { ResolvedConfig } from './types';

interface Shared {
  config: ResolvedConfig;
}

export const shared: Shared = {} as any;
