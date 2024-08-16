import config from './config.json';
import { Transporter } from './transporter';

function connect() {
  const port = (config as any).perf.socket.port;
  const ws = new WebSocket(`ws://localhost:${port}`);

  return new Transporter(ws);
}

connect();
