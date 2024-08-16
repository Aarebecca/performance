/**
 * @description
 * - assign: server is assigning a task
 * - complete: server is notifying client that all tasks are completed
 * - disconnect: server is notifying client to disconnect
 */
export type ServerSignal = 'assign' | 'complete';

/**
 * @description
 * - ready: client is ready to receive tasks
 * - request: client is requesting for tasks
 * - report: client is sending back the result of current task
 */
export type ClientSignal = 'ready' | 'request' | 'report' | 'disconnect';

export interface ServerAssignMessage {
  signal: 'assign';
  task: string;
}

export interface ServerCompleteMessage {
  signal: 'complete';
}

export interface ServerDisconnectMessage {
  signal: 'disconnect';
}

export type ServerMessage =
  | ServerAssignMessage
  | ServerCompleteMessage
  | ServerDisconnectMessage;

export interface ClientReadyMessage {
  signal: 'ready';
  tasks: string[];
  userAgent: string;
}

export interface ClientRequestMessage {
  signal: 'request';
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

export interface ClientDisconnectMessage {
  signal: 'disconnect';
}

export type ClientMessage =
  | ClientReadyMessage
  | ClientRequestMessage
  | ClientReportMessage
  | ClientDisconnectMessage;
