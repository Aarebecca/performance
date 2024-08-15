export function print(msg: string) {
  console.log(`[perf]${msg}`);
}

print.info = (msg: string) => {
  console.log(`[perf]\x1b[34m${msg}\x1b[0m`);
};

print.success = (msg: string) => {
  console.log(`[perf]\x1b[32m${msg}\x1b[0m`);
};

print.warn = (msg: string) => {
  console.log(`[perf]\x1b[33m${msg}\x1b[0m`);
};

print.error = (msg: string) => {
  console.log(`[perf]\x1b[31m${msg}\x1b[0m`);
};
