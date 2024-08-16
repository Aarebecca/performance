import { WebSocketServer } from 'ws';
import { exportReport } from './reporter';
import { print } from './print';
import type { ResolvedConfig } from './types';

export function createServer(config: ResolvedConfig) {
  const socket = config.perf.socket;
  const port = socket.port;
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    let timeout: NodeJS.Timeout;
    let schedular: Schedular;

    print.info(`Open connection on port: ${port}`);

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
        const data = JSON.parse(str);
        const { signal } = data;

        if (signal === 'ready') {
          schedular = new Schedular(data.userAgent, data.list);
          print.info(`Ready to start, tasks: ${data.list.length}`);
        } else if (signal === 'request') {
          const task = schedular.assign();
          if (task) {
            print(`Assigning task: \x1b[32m\x1b[1m${task}\x1b[0m`);
            ws.send(JSON.stringify({ signal: 'assign', task }));
          } else {
            ws.send(JSON.stringify({ signal: 'complete' }));
            print.success('All tasks completed.');
            await schedular.save();
            process.exit(0);
          }
        } else if (signal === 'report') {
          if (!data.result.passed) print.error(`Task failed: ${data.task}`);
          schedular.report(data.task, data.result);
        }
      } catch (e: any) {
        ws.send(`error: ${e.message}`);
        ws.send(JSON.stringify({ signal: 'disconnect' }));
      }
    });

    ws.on('close', () => {
      close();
    });
  });

  return wss;
}

type ServerSignal = 'assign' | 'complete' | 'disconnect';

/**
 * @description
 * - ready: client is ready to receive tasks
 * - request: client is requesting for tasks
 * - report: client is sending back the result of current task
 */
type ClientSignal = 'ready' | 'request' | 'report';

class Schedular {
  constructor(private userAgent: string, private tasks: string[]) {}

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
