import type {
  UserConfig as ViteUserConfig,
  ResolvedConfig as ViteResolvedConfig,
} from 'vite';

export interface UserConfig extends ViteUserConfig {
  perf?: PerfConfig;
}

export interface ResolvedConfig extends ViteResolvedConfig {
  perf: Required<PerfConfig>;
}

interface PerfConfig {
  root?: string;
  testRegex?: string;
  socketPort?: number;
  reportDir?: string;
}
