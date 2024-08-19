import type { FrameRecord } from './types';

export class Performance {
  #marks: Record<string, number> = {};

  /**
   * mark a performance point
   */
  mark(name: string) {
    return performance.mark(name);
  }

  /**
   * evaluate the runtime of given function
   */
  evaluate(name: string, call: () => Promise<void>): Promise<number>;
  /**
   * evaluate the duration between two marks
   */
  evaluate(name: string, start: string, end: string): number;
  evaluate(
    name: string,
    argv: string | (() => Promise<void>),
    end?: string,
  ): number | Promise<number> {
    if (typeof argv === 'function') {
      const call = argv;
      const [startMark, endMark] = [name + '-start', name + '-end'];
      performance.mark(startMark);

      try {
        return call().then(() => {
          performance.mark(endMark);
          return this.#measure(name, startMark, endMark);
        });
      } catch (e) {
        return NaN;
      }
    }

    return this.#measure(name, argv, end!);
  }

  #measure(name: string, start: string, end: string) {
    performance.measure(name, start, end);
    const entry = performance.getEntriesByName(name)[0];
    const duration = entry.duration;
    this.#marks[name] = duration;
    return duration;
  }

  /**
   * Whether the frame collection is enabled
   */
  #frameEnable: boolean = true;

  #frameRecord: FrameRecord[] = [];

  #collectFrameData() {
    if (!this.#frameEnable) return;
    this.#frameRecord.push({
      time: performance.now(),
      memory: (performance as any).memory?.usedJSHeapSize || NaN,
    });
  }

  /**
   * Collect frame data
   */
  frame() {
    this.#frameEnable = true;
    this.#collectFrameData();
  }

  /**
   * Stop collecting frame data
   */
  frameStop() {
    this.#frameEnable = false;
  }

  /**
   * Clear frame data
   */
  frameReset() {
    this.#frameRecord = [];
  }

  /**
   * Reset all performance data
   */
  reset() {
    performance.clearMarks();
    performance.clearMeasures();
    this.frameReset();
  }

  /**
   * Export performance results
   */
  export(reset: boolean = true) {
    const results: Record<string, any> = {};

    if (Object.keys(this.#marks).length > 0) results.time = { ...this.#marks };
    if (this.#frameRecord.length > 0) results.frame = [...this.#frameRecord];

    if (reset) this.reset();

    return results;
  }
}
