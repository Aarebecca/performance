import { writeFileSync } from 'fs';
import { join } from 'path';
import type { Plugin } from 'vite';
import { __temp_dir__ } from './constants';
import { Controller } from './controller';
import { print } from './print';
import { shared } from './shared';
import type { ResolvedConfig } from './types';

export function Performance(): Plugin {
  return {
    name: 'vite-plugin-performance-test',

    configResolved(config) {
      shared.config = config as any;
      // write config to client
      writeFileSync(
        join(__temp_dir__, 'config.json'),
        JSON.stringify(config, null, 2),
      );
    },

    configureServer(server) {
      const config = server.config as ResolvedConfig;
      const controller = new Controller();
      controller.createServer(config);

      return () => {
        const host = `http://localhost:${config.server.port}`;

        print.info(`Performance server is running at: ${host}`);

        controller.start(host);
      };
    },
  };
}
