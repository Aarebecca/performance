import { __temp_dir__ } from './constants';
import { Performance } from './plugin';
import type { UserConfig } from './types';

export function defineConfig(
  config: Omit<UserConfig, 'root'> = {},
): UserConfig {
  const { plugins = [], server } = config;

  return {
    ...config,
    plugins: [...plugins, Performance()],
    perf: {
      root: process.cwd(),
      ...config.perf,
      report: {
        dir: 'perf/reports',
        ...config.perf?.report,
      },
      socket: {
        port: 3000,
        timeout: 5 * 60 * 1000, // 5 minutes
        ...config.perf?.socket,
      },
    },
    root: __temp_dir__,
    server: {
      port: 8080,
      open: '/',
      ...server,
    },
  };
}
