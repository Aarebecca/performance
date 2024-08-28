import config from './config.json';
import { Transporter } from './transporter';

function connect() {
  const port = (config as any).perf.socket.port;

  return new Transporter(port);
}

connect();
