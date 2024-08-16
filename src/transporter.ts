import type { WebSocket } from 'ws';
import { print } from './print';
import type {
  ClientMessage,
  ClientReadyMessage,
  ClientReportMessage,
} from './protocol';
import { Schedular } from './schedular';

export class Transporter {
  private schedular!: Schedular;

  constructor(
    private ws: WebSocket,
    private config: { timeout: number },
  ) {
    ws.on('message', async (message) => {
      this.setTimeout();
      const data: ClientMessage = JSON.parse(message.toString());
      const { signal } = data;

      if (signal === 'ready') this.onClientReady(data);
      else if (signal === 'request') this.assign();
      else if (signal === 'report') this.record(data);
      else if (signal === 'disconnect') this.disconnect();
    });
  }

  private send(msg: Record<string, any>) {
    this.ws.send(JSON.stringify(msg));
  }

  private timeout!: NodeJS.Timeout;

  private setTimeout() {
    if (this.config.timeout) return;

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      print.error('Client timeout.');
      this.disconnect();
    }, this.config.timeout);
  }

  private onClientReady(data: ClientReadyMessage) {
    this.schedular = new Schedular(data.userAgent, data.tasks);

    print(`Total tasks: ${data.tasks.length}`);
  }

  private assign() {
    const task = this.schedular.assign();
    if (task) {
      this.send({ signal: 'assign', task });

      print(`Assigning task: \x1b[32m\x1b[1m${task}\x1b[0m`);
    } else {
      print.success('All tasks completed.');

      this.schedular.save().then(() => {
        this.send({ signal: 'complete' });
      });
    }
  }

  private record(data: ClientReportMessage) {
    const { task, result } = data;
    const status = result.status;

    if (status === 'passed') print.success(`Task ${data.task} completed`);
    else if (status === 'skipped') print.warn(`Task ${data.task} skipped`);
    else if (status === 'failed') print.error(`Task ${data.task} failed`);

    this.schedular.report(task, result);
  }

  private disconnect() {
    print.info('Connection closed.');
    this.ws.close();
    process.exit(0);
  }
}
