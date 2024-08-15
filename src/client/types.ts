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
  epochs?: number;
}
