import type { Performance } from './performance';

export interface TimeRecord {
  [key: string]: {
    duration: number;
    memory: number;
  };
}

export interface FrameRecord {
  time: number;
  memory: number;
}

export interface TestContext {
  perf: Performance;
  container: HTMLElement;
}

export interface Test {
  (context: TestContext): Promise<void>;
  /**
   * Number of iterations to run the test.
   * Default is 10.
   */
  iteration?: number;
  skip?: boolean;
  only?: boolean;
}

export interface RawRecords {
  time?: TimeRecord;
  frame?: FrameRecord[];
}
