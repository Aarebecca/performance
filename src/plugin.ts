import type { Plugin } from 'vite';
import { createServer } from './server';
import { UserConfig } from './types';
import { shared } from './shared';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { __temp_dir__ } from './constants';

export function Performance(): Plugin {
  return {
    name: 'vite-plugin-antv-performance',

    configResolved(config) {
      shared.config = config as any;
      // write config to client
      writeFileSync(
        join(__temp_dir__, 'config.json'),
        JSON.stringify(config, null, 2)
      );
    },

    configureServer(server) {
      const port = (server.config as unknown as Required<UserConfig>).perf
        .socketPort!;
      // process.exit(port);
      createServer(port);
    },
  };
}
