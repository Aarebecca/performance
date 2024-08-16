import * as tests from './exports';
import { Runner } from './runner';
import type { Test } from './types';

const tasks = { ...tests } as Record<string, Test>;

export class Transporter {
  private runner: Runner;

  constructor(private ws: WebSocket) {
    this.runner = new Runner(tasks);

    ws.onopen = () => {
      this.ready();
      this.request();
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const { signal } = data;
      if (signal === 'assign') this.execute(data.task);
      else if (signal === 'complete') this.disconnect();
    };
  }

  private ready() {
    const entries = Object.entries(tasks);

    const only: string[] = [];
    const rest: string[] = [];
    entries.forEach(([task, test]) => {
      if (test.only) only.push(task);
      else if (!test.skip) rest.push(task);
    });

    this.send({
      signal: 'ready',
      tasks: only.length > 0 ? only : rest,
      userAgent: navigator.userAgent,
    });
  }

  private send(msg: Record<string, any>) {
    this.ws.send(JSON.stringify(msg));
  }

  private request() {
    this.send({ signal: 'request' });
  }

  private async execute(task: string) {
    const result = await this.runner.execute(task);
    this.send({ signal: 'report', task, result });
    this.send({ signal: 'request' });
  }

  private disconnect() {
    this.send({ signal: 'disconnect' });
    this.ws.close();
  }
}
