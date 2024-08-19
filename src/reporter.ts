import { execSync } from 'child_process';
import crypto from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import si from 'systeminformation';
import { print } from './print';
import { shared } from './shared';

export async function exportReport(data: any) {
  const reportDir = shared.config.perf.report.dir;
  const reportVersion = '1.0';
  const deviceInfo = await getDeviceInfo();
  const repoHash = getRepoInfo();

  const serial = deviceInfo.serial.slice(0, 8);

  const filename = `${serial}_${getTimeString()}.json`;

  const reportPath = join(shared.config.perf.root, reportDir, filename);

  mkdirSync(join(shared.config.perf.root, reportDir), {
    recursive: true,
  });

  writeFileSync(
    reportPath,
    JSON.stringify({
      version: reportVersion,
      device: deviceInfo,
      repo: repoHash,
      ...data,
    }),
  );

  print(`Report exported to: \x1b[36m${join(reportDir, filename)}\x1b[0m`);
}

async function getDeviceInfo() {
  const info: Record<string, any> = {};

  assign(info, await si.osInfo(), ['arch', 'distro', 'serial']);

  if (info.serial) info.serial = getHash(info.serial);

  assign(info, await si.cpu(), ['manufacturer', 'brand', 'speed', 'cores']);

  assign(info, await si.mem(), ['total', 'free']);

  const { controllers = [] } = await si.graphics();
  if (controllers.length) {
    assign(info, controllers[0], ['vendor', 'model', 'cores']);
  }

  return info;
}

function getRepoInfo() {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    return `time:${getTimeString()}`;
  }
}

function getHash(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function assign<T extends Record<any, any>>(
  target: Record<any, any>,
  source: T,
  keys: (keyof T)[],
) {
  for (const key of keys) {
    if (source[key] !== undefined) target[key] = source[key];
  }
  return target;
}

function getTimeString(date = new Date()) {
  return Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .format(date)
    .replace(/\//g, '-')
    .replace(' ', '_');
}
