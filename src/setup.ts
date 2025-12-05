import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
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
  let tests: string[] = [];

  // Try to read testFiles from temporary config file if it exists
  const tempConfigPath = join(viteDir, 'perf.config.js');
  if (existsSync(tempConfigPath)) {
    const configContent = readFileSync(tempConfigPath, 'utf-8');
    const testFilesMatch = configContent.match(/testFiles:\s*(\[.*?\])/);
    if (testFilesMatch) {
      try {
        const testFiles = JSON.parse(testFilesMatch[1]);
        if (Array.isArray(testFiles) && testFiles.length > 0) {
          tests = testFiles.map((file: string) => join(userDir, file));
        }
      } catch (e) {
        // Failed to parse testFiles, fallback to default regex
      }
    }
  }

  // If no specific files provided, use glob pattern
  if (tests.length === 0) {
    const testRegex = __tests_regex__;
    tests = sync(testRegex, { cwd: userDir }).map((file) =>
      join(userDir, file)
    );
  }

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
