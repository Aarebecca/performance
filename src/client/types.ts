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
  /**
   * Execute after each iteration.
   * @param returns The return value of the test.
   */
  after?: (returns: any) => Promise<void>;
}

export interface RawRecords {
  time?: TimeRecord;
  frame?: FrameRecord[];
}
