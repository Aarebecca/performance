import { analyzeFrame, analyzeTime } from './analyze';
import { Performance } from './performance';
import type { RawRecords, Test } from './types';

export class Runner {
  #init() {
    this.container.innerHTML = '';
  }

  private get container() {
    return document.getElementById('__test_root__')!;
  }

  constructor(private tasks: Record<string, Test>) {}

  async execute(task: string) {
    this.#init();
    const test = this.tasks[task];

    if (typeof test === 'function') {
      return await this.iterate(task, test);
    }

    return { status: 'skipped' };
  }

  async iterate(name: string, callback: Test) {
    const perf = new Performance();
    const context = { perf, container: this.container };
    const results: RawRecords[] = [];

    const iterations = callback.iteration ?? 10;

    console.log(`Start ${name}...`);
    try {
      for (let i = 0; i < iterations; i++) {
        this.#init();
        console.log(`Start ${name} in epoch: ${i}`);
        await callback(context);
        results.push(perf.export());

        // wait time to release the memory
        await delay(500);
      }
    } catch (e) {
      console.error(`Error in ${name}:`, e);
      return { status: 'failed' };
    }
    console.log(`Complete ${name}`);

    return this.statistic(results);
  }

  statistic(records: RawRecords[]) {
    const results = {};

    const _analyzeTime = () => {
      if (!records[0].time) return;
      const timeKeys = Object.keys(records[0].time);

      const time: Record<string, number[]> = {};
      const memory: Record<string, number[]> = {};

      records.forEach((record) => {
        timeKeys.forEach((key) => {
          if (!time[key]) time[key] = [];
          if (!memory[key]) memory[key] = [];
          time[key].push(record.time![key].duration);
          memory[key].push(record.time![key].memory);
        });
      });

      const timeResult = timeKeys.map((key) => {
        const result = analyzeTime(time[key], memory[key]);

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

      const frameResults = records.map((record) =>
        analyzeFrame(record.frame?.map((f: { time: number }) => f.time) || []),
      );
      const sorted = frameResults.toSorted((a, b) => a.variance - b.variance);
      Object.assign(results, { frame: sorted[0] });
    };

    _analyzeTime();
    _analyzeFrame();

    Object.assign(results, { status: 'passed' });

    return results;
  }

  async preview(task: string) {
    const test = this.tasks[task];

    if (typeof test === 'function') {
      const perf = new Performance();
      const context = { perf, container: this.container };
      this.#init();
      await test(context);

      console.log(perf.export());
    }
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
