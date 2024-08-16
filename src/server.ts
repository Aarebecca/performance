import { WebSocketServer } from 'ws';
import { print } from './print';
import type { ClientMessage, ServerMessage } from './protocol';
import { exportReport } from './reporter';
import type { ResolvedConfig } from './types';

export function createServer(config: ResolvedConfig) {
  const socket = config.perf.socket;
  const port = socket.port;
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    let timeout: NodeJS.Timeout;
    let schedular: Schedular;

    print.info(`Open connection on port: ${port}`);

    const send = (message: ServerMessage) => {
      ws.send(JSON.stringify(message));
    };

    const close = () => {
      ws.send(JSON.stringify({ signal: 'disconnect' }));
      ws.close();
    };

    ws.on('message', async (message) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        print.error('Client timeout.');
        close();
      }, socket.timeout);

      const str = message.toString();
      try {
        const data = JSON.parse(str) as ClientMessage;
        const { signal } = data;

        if (signal === 'ready') {
          schedular = new Schedular(data.userAgent, data.tasks);
          print(`Total tasks: ${data.tasks.length}`);
        } else if (signal === 'request') {
          const task = schedular.assign();
          if (task) {
            print(`Assigning task: \x1b[32m\x1b[1m${task}\x1b[0m`);
            send({ signal: 'assign', task });
          } else {
            send({ signal: 'complete' });
            print.success('All tasks completed.');
            await schedular.save();
            process.exit(0);
          }
        } else if (signal === 'report') {
          switch (data.result.status) {
            case 'passed':
              print.success(`Task ${data.task} completed`);
              break;
            case 'skipped':
              print.warn(`Task ${data.task} skipped`);
              break;
            case 'failed':
              print.error(`Task ${data.task} failed`);
              break;
            default:
              break;
          }

          schedular.report(data.task, data.result);
        }
      } catch (e: any) {
        print.error(e.message);
        send({ signal: 'disconnect' });
      }
    });

    ws.on('close', () => {
      close();
    });
  });

  return wss;
}

class Schedular {
  constructor(
    private userAgent: string,
    private tasks: string[],
  ) {}

  #index = 0;

  private reports: Record<string, any> = {};

  assign(): string | null {
    if (this.#index < this.tasks.length) {
      return this.tasks[this.#index++];
    }
    return null;
  }

  report(task: string, result: any) {
    this.reports[task] = result;
  }

  async save() {
    await exportReport({ client: this.userAgent, reports: this.reports });
  }
}
