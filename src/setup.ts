import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from 'fs';
import { sync } from 'glob';
import { join } from 'path';
import { __temp_dir__, __tests_regex__ } from './constants';

setup();

export function setup() {
  const viteDir = __temp_dir__;
  const userDir = process.cwd();
  if (!existsSync(viteDir)) mkdirSync(viteDir);

  // copy client files
  copyFiles(join(__dirname, 'client'), viteDir);

  // write exports
  const testRegex = __tests_regex__;
  const tests = sync(testRegex, { cwd: userDir }).map((file) =>
    join(userDir, file)
  );
  writeFileSync(
    join(viteDir, 'exports.js'),
    tests.map((test) => `export * from '${test}'`).join('\n')
  );
}

function copyFiles(sourceDir: string, targetDir: string) {
  mkdirSync(targetDir, { recursive: true });

  readdirSync(sourceDir).forEach((file) => {
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);
    copyFileSync(sourcePath, targetPath);
  });
}
