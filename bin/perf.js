#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
require('../dist/setup.js');

const configFilePath = path.join(process.cwd(), 'perf.config.js');
const vitePath = path.join(process.cwd(), 'node_modules/.bin/vite');

if (fs.existsSync(configFilePath)) {
  console.log('Start to run performance test...');

  const child = spawn('node', [vitePath, '--config', configFilePath]);

  child.stdout.on('data', (data) => {
    const msg = `${data}`;
    if (msg.startsWith('[perf]')) console.log(msg);
  });

  child.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  child.on('close', (code) => {
    console.log(`\x1b[32mPerformance test done.\x1b[0m`);
  });

  // TODO 使用 playwright 打开浏览器
} else {
  console.log('perf.config.json does not exist');
}
