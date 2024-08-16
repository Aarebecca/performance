import { exportReport } from './reporter';

export class Schedular {
  constructor(
    private userAgent: string,
    private tasks: string[],
  ) {}

  #index = 0;

  private reports: Record<string, any> = {};

  assign(): string | null {
    if (this.#index < this.tasks.length) {
      return this.tasks[this.#index++];
    }
    return null;
  }

  report(task: string, result: any) {
    this.reports[task] = result;
  }

  async save() {
    await exportReport({ client: this.userAgent, reports: this.reports });
  }
}
