/**
 * @description
 * - assign: server is assigning a task
 * - complete: server is notifying client that all tasks are completed
 * - disconnect: server is notifying client to disconnect
 */
type ServerSignal = 'assign' | 'complete' | 'disconnect';

/**
 * @description
 * - ready: client is ready to receive tasks
 * - request: client is requesting for tasks
 * - report: client is sending back the result of current task
 */
type ClientSignal = 'ready' | 'request' | 'report';

interface Message {
  signal: ServerSignal | ClientSignal;
}

interface ServerAssignMessage {
  signal: 'assign';
  task: string;
}

interface ServerCompleteMessage {
  signal: 'complete';
}

interface ServerDisconnectMessage {
  signal: 'disconnect';
}

export type ServerMessage =
  | ServerAssignMessage
  | ServerCompleteMessage
  | ServerDisconnectMessage;

interface ClientReadyMessage {
  signal: 'ready';
  tasks: string[];
  userAgent: string;
}

interface ClientRequestMessage {
  signal: 'request';
}

interface ClientReportMessage {
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

export type ClientMessage =
  | ClientReadyMessage
  | ClientRequestMessage
  | ClientReportMessage;
