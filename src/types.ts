import type {
  ResolvedConfig as ViteResolvedConfig,
  UserConfig as ViteUserConfig,
} from 'vite';

export interface UserConfig extends ViteUserConfig {
  perf?: PerfConfig;
}

export interface ResolvedConfig extends ViteResolvedConfig {
  perf: DeepRequired<PerfConfig>;
}

interface PerfConfig {
  root?: string;
  testRegex?: string;
  report?: {
    dir?: string;
  };
  socket?: {
    port?: number;
    timeout?: number;
  };
}

type DeepRequired<T> = {
  [K in keyof T]-?: Required<DeepRequired<T[K]>>;
};
