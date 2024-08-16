import config from './config.json';
import * as tests from './exports';
import { Runner } from './runner';
import type { Test } from './types';

const tasks = { ...tests } as Record<string, Test>;

function connect() {
  const port = (config as any).perf.socket.port;

  const ws = new WebSocket(`ws://localhost:${port}`);
  const runner = new Runner(tasks);

  ws.onopen = () => {
    console.log('WebSocket connected on port:', port);

    ws.send(
      JSON.stringify({
        signal: 'ready',
        tasks: Object.keys(tasks),
        userAgent: navigator.userAgent,
      }),
    );
    ws.send(JSON.stringify({ signal: 'request' }));
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    const { signal } = data;
    if (signal === 'assign') {
      const result = await runner.execute(data.task);
      ws.send(JSON.stringify({ signal: 'report', task: data.task, result }));
      ws.send(JSON.stringify({ signal: 'request' }));
    } else if (signal === 'complete') {
      ws.close();
      // window.close();
    } else if (signal === 'disconnect') {
      ws.close();
    }
  };

  return ws;
}

connect();
