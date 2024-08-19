import type { FrameRecord, RawRecords, TimeRecord } from './types';

export class Performance {
  #marks: TimeRecord = {};

  /**
   * mark a performance point
   */
  mark(name: string) {
    return performance.mark(name);
  }

  /**
   * measure the time between two marks
   */
  measure(name: string, start: string, end: string) {
    return this.#measure(name, start, end);
  }

  /**
   * execute a function and measure the time
   */
  async evaluate(name: string, fn: () => Promise<void>): Promise<number> {
    const [start, end] = [name + '-start', name + '-end'];
    this.mark(start);

    await fn();

    this.mark(end);
    return this.#measure(name, start, end);
  }

  #measure(name: string, start: string, end: string) {
    performance.measure(name, start, end);
    const entry = performance.getEntriesByName(name)[0];
    const duration = entry.duration;
    this.#marks[name] = {
      duration,
      memory: (performance as any).memory?.usedJSHeapSize || NaN,
    };
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
  export(reset: boolean = true): RawRecords {
    const results: Record<string, any> = {};

    if (Object.keys(this.#marks).length > 0) results.time = { ...this.#marks };
    if (this.#frameRecord.length > 0) results.frame = [...this.#frameRecord];

    if (reset) this.reset();

    return results;
  }
}
