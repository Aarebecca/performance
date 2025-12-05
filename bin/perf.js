#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
require('../dist/setup.js');

// Parse command line arguments
const args = process.argv.slice(2);
let preview = false;
let testFiles = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === 'preview') {
    preview = true;
  } else if (arg === '--file' || arg === '-f') {
    // Collect all file arguments
    i++;
    while (i < args.length && !args[i].startsWith('-') && args[i] !== 'preview') {
      testFiles.push(args[i]);
      i++;
    }
    i--; // Step back one since the loop will increment
  }
}

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

  // Pass testFiles to config if specified
  const testFilesConfig = testFiles.length > 0
    ? `testFiles: ${JSON.stringify(testFiles)},`
    : '';

  fs.writeFileSync(
    actualConfigPath,
    `import { defineConfig } from 'iperf';export default defineConfig({perf: {${testFilesConfig}}});`,
  );
}

if (preview) {
  console.log('Enter preview mode...');
  process.env.PREVIEW = true;
} else {
  const fileInfo = testFiles.length > 0
    ? ` (specific files: ${testFiles.join(', ')})`
    : '';
  console.log(`Start to run performance test${fileInfo}...`);
}

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
