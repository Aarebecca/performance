import type { Performance } from './performance';

export interface FrameRecord {
  time: number;
  memory: number;
}

export interface TestContext {
  perf: Performance;
}

export interface Test {
  (context: TestContext): Promise<void>;
  /**
   * Number of iterations to run the test.
   * Default is 10.
   */
  iteration?: number;
}
