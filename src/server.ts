import { WebSocketServer } from 'ws';
import { print } from './print';
import { Transporter } from './transporter';
import type { ResolvedConfig } from './types';

export function createServer(config: ResolvedConfig) {
  const socket = config.perf.socket;
  const port = socket.port;
  const wss = new WebSocketServer({ port });
  let transporter: Transporter;

  wss.on('connection', (ws) => {
    print.info(`Open connection on port: ${port}`);

    transporter = new Transporter(ws, {
      timeout: config.perf.socket.timeout,
    });
  });

  return wss;
}
