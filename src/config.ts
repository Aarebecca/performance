import type { UserConfig } from './types';
import { Performance } from './plugin';
import { __temp_dir__, __user_dir__ } from './constants';

export function defineConfig(
  config: Omit<UserConfig, 'root'> = {}
): UserConfig {
  const { plugins = [], server } = config;

  return {
    ...config,
    plugins: [...plugins, Performance()],
    perf: {
      root: process.cwd(),
      reportDir: 'perf/reports',
      socketPort: 3000,
      ...config.perf,
    },
    root: __temp_dir__,
    server: {
      port: 8080,
      open: '/',
      ...server,
    },
  };
}
