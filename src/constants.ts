import { join } from 'path';

const root = process.cwd();

export const __user_dir__ = root;

export const __temp_dir__ = join(root, '/node_modules/.perf');

export const __tests_exports__ = __temp_dir__ + '/exports.js';

export const __tests_regex__ = '**/*.perf.ts';
