#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
require('../dist/setup.js');

const userConfigPath = path.join(process.cwd(), 'perf.config.js');
const vitePath = path.join(
  path.dirname(require.resolve('vite')),
  '/bin/vite.js',
);

let actualConfigPath = userConfigPath;

if (!fs.existsSync(userConfigPath)) {
  actualConfigPath = path.join(
    process.cwd(),
    '/node_modules/.perf',
    'perf.config.js',
  );

  fs.writeFileSync(
    actualConfigPath,
    `import { defineConfig } from 'perf';export default defineConfig({});`,
  );
}

console.log('Start to run performance test...');

const child = spawn('node', [vitePath, '--config', actualConfigPath]);

child.stdout.on('data', (data) => {
  const msg = `${data}`;
  if (msg.startsWith('[perf]')) console.log(msg);
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', () => {
  console.log(`\x1b[32mPerformance test done.\x1b[0m`);
});
