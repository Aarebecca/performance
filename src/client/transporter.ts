import * as tests from './exports';
import { Runner } from './runner';
import type { Test } from './types';

const tasks = { ...tests } as Record<string, Test>;

export class Transporter {
  private runner: Runner;

  private ws?: WebSocket;

  constructor(port: string) {
    this.runner = new Runner(tasks);

    const type = this.getSearchParam('type');
    const task = this.getSearchParam('task');

    if (type === 'preview') {
      this.preview();
    } else {
      const ws = new WebSocket(`ws://localhost:${port}`);
      ws.onopen = () => {
        if (type === 'preview') this.preview();
        else if (type === 'init') this.ready();
        else if (type === 'assign' && task) this.execute(task);
      };
      this.ws = ws;
    }
  }

  private getSearchParam(param: string) {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  }

  private setSearchParam(param: string, value: string) {
    const params = new URLSearchParams(location.search);
    params.set(param, value);
    history.replaceState(null, '', `${location.pathname}?${params}`);
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
    this.ws?.send(JSON.stringify(msg));
  }

  private async execute(task: string) {
    const result = await this.runner.execute(task);
    this.send({ signal: 'report', task, result });
  }

  private preview() {
    const container = document.createElement('div');
    const select = document.createElement('select');

    const empty = document.createElement('option');
    empty.value = '';
    empty.text = '⚠️ Select a task to preview';
    select.appendChild(empty);
    for (const task in tasks) {
      const option = document.createElement('option');
      option.value = task;
      option.text = task;
      select.appendChild(option);
    }
    select.onchange = () => {
      this.runner.preview(select.value);
      this.setSearchParam('preset', select.value);
    };
    const preset = this.getSearchParam('preset');
    if (preset) select.value = preset;

    // button
    const button = document.createElement('button');
    button.textContent = 'Run Current';
    button.onclick = () => {
      if (select.value) this.runner.preview(select.value);
    };

    document.body.prepend(container);
    container.appendChild(select);
    container.appendChild(button);
  }
}
