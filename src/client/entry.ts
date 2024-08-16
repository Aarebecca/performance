import { analyzeFrame, analyzeTime } from './analysis';
import config from './config.json';
import * as tests from './exports';
import { Performance } from './performance';
import type { Test } from './types';

const tasks = { ...tests } as Record<string, Test>;

function connect() {
  const port = (config as any).perf.socket.port;

  const ws = new WebSocket(`ws://localhost:${port}`);
  const runner = new Runner();

  ws.onopen = () => {
    console.log('WebSocket connected on port:', port);

    ws.send(
      JSON.stringify({
        signal: 'ready',
        list: Object.keys(tasks),
        userAgent: navigator.userAgent,
      }),
    );
    ws.send(JSON.stringify({ signal: 'request' }));
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    const { signal } = data;
    if (signal === 'assign') {
      const result = await runner.execute(data.task);
      ws.send(JSON.stringify({ signal: 'report', task: data.task, result }));
      ws.send(JSON.stringify({ signal: 'request' }));
    } else if (signal === 'complete') {
      ws.close();
      window.close();
    } else if (signal === 'disconnect') {
      ws.close();
    }
  };

  return ws;
}

class Runner {
  #config = {
    epochs: 10,
  };

  #init() {
    const root = document.getElementById('__test_root__')!;
    root.innerHTML = '';
  }

  async execute(task: string) {
    this.#init();
    const test = tasks[task];

    if (typeof test === 'function') {
      return await this.iterate(task, test);
    }

    console.warn(`Test ${task} is unsupported, it will be skipped.`);
    return { passed: false };
  }

  async iterate(name: string, callback: Test) {
    const perf = new Performance();
    const context = { perf };
    const results = [];

    const epochs = callback.epochs ?? this.#config.epochs;

    console.log(`Start ${name}...`);
    try {
      for (let i = 0; i < epochs; i++) {
        console.log(`Start ${name} in epoch: ${i}`);
        await callback(context);
        results.push(perf.export());
      }
    } catch (e) {
      console.error(`Error in ${name}:`, e);
    }
    console.log(`Complete ${name}`);

    return this.statistic(results);
  }

  statistic(records: any[]) {
    console.log('statistic', records);
    const results = {};

    if (records.length === 0) return { passed: false };

    const _analyzeTime = () => {
      if (!records[0].time) return;
      const timeKeys = Object.keys(records[0].time);

      const time: Record<string, number[]> = {};

      records.forEach((record) => {
        timeKeys.forEach((key) => {
          if (!time[key]) time[key] = [];
          time[key].push(record.time[key]);
        });
      });

      const timeResult = timeKeys.map((key) => {
        const result = analyzeTime(time[key]);

        if (!result.reliable) {
          console.warn(`The evaluation of ${key} is too fast to be reliable.`);
        }

        Object.assign(result, { key });
        return result;
      });

      Object.assign(results, { time: timeResult });
    };

    const _analyzeFrame = () => {
      if (!records[0].frame) return;

      const frameResults = records.map((record) => analyzeFrame(record.frame));
      const sorted = frameResults.toSorted((a, b) => a.variance - b.variance);
      Object.assign(results, { frame: sorted[0] });
    };

    _analyzeTime();
    _analyzeFrame();

    Object.assign(results, { passed: true });

    return results;
  }
}

connect();
