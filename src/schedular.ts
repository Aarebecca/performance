import { ClientReportMessage } from './protocol';
import { exportReport } from './reporter';

export class Schedular {
  constructor(
    private userAgent: string,
    private tasks: string[],
  ) {}

  #index = 0;

  private reports: Record<string, any> = {};

  getTask() {
    if (this.#index < this.tasks.length) {
      return this.tasks[this.#index++];
    }
    return null;
  }

  report(data: ClientReportMessage) {
    const { task, result } = data;
    this.reports[task] = result;
  }

  async save() {
    await exportReport({ client: this.userAgent, reports: this.reports });
  }
}
