import * as tests from './exports';
import { Runner } from './runner';
import type { Test } from './types';

const tasks = { ...tests } as Record<string, Test>;

export class Transporter {
  private runner: Runner;

  constructor(private ws: WebSocket) {
    this.runner = new Runner(tasks);

    const type = this.getSearchParam('type');
    const task = this.getSearchParam('task');

    ws.onopen = () => {
      if (type === 'init') this.ready();
      else if (type === 'assign' && task) this.execute(task);
    };
  }

  private getSearchParam(param: string) {
    const params = new URLSearchParams(location.search);
    return params.get(param);
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

  private async execute(task: string) {
    const result = await this.runner.execute(task);
    this.send({ signal: 'report', task, result });
  }
}
