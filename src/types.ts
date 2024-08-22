import type { LaunchOptions } from 'playwright';
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
  /**
   * The root directory of the project
   */
  root?: string;
  /**
   * The test regex to run
   */
  testRegex?: string;
  report?: {
    /**
     * The directory to store the reports
     */
    dir?: string;
  };
  socket?: {
    /**
     * The port of the socket server
     */
    port?: number;
    /**
     * The number of milliseconds to wait before timing out
     */
    timeout?: number;
  };
  browser?: Pick<LaunchOptions, 'headless' | 'devtools' | 'args'>;
}

type DeepRequired<T> = {
  [K in keyof T]-?: Required<DeepRequired<T[K]>>;
};
