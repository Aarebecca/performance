declare global {
  interface Window {
    perf: Perf;
  }
}

interface Perf {
  mark: (name: string) => void;
  evaluate: (name: string, start: string, end: string) => number;
  frame: () => void;
  frameStop: () => void;
  frameReset: () => void;
  reset: () => void;
}

export {};
