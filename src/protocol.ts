/**
 * @description
 * - ready: client is ready to receive tasks
 * - request: client is requesting for tasks
 * - report: client is sending back the result of current task
 */
export type ClientSignal = 'ready' | 'report';

export interface ClientReadyMessage {
  signal: 'ready';
  tasks: string[];
  userAgent: string;
}

export interface ClientReportMessage {
  signal: 'report';
  task: string;
  result: {
    status: 'passed' | 'failed' | 'skipped';
    time?: {
      key: string;
      min: number;
      max: number;
      median: number;
      avg: number;
      variance: number;
      reliable: boolean;
    }[];
    frame?: {
      min: number;
      avg: number;
      variance: number;
    };
  };
}

export type ClientMessage = ClientReadyMessage | ClientReportMessage;
