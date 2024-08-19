export function analyzeTime(values: number[], memories: number[]) {
  const sorted = values.toSorted();
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const threshold = 5;
  const reliable = min >= threshold;

  const prune = sorted.slice(1, -1);

  const median = prune.at(Math.floor(prune.length / 2))!;
  const sum = prune.reduce((acc, cur) => acc + cur, 0);
  const avg = sum / prune.length;
  const variance =
    prune.reduce((acc, cur) => acc + (cur - avg) ** 2, 0) / prune.length;

  const memory =
    memories.reduce((acc, cur) => acc + cur, 0) / memories.length / 1024 / 1024;

  return { min, max, median, avg, variance, reliable, memory };
}

export function analyzeFrame(values: number[]) {
  // Calculate the frame rate and time interval of each frame
  const intervals: number[] = [];
  const FRs = [];
  for (let i = 1; i < values.length; i++) {
    let interval = values[i] - values[i - 1];
    intervals.push(interval);
    FRs.push(1000 / interval);
  }

  // Calculate the weighted average frame rate
  const weightedSum = FRs.reduce(
    (sum, rate, i) => sum + rate * intervals[i],
    0,
  );
  const totalInterval = intervals.reduce((sum, interval) => sum + interval, 0);
  const weightedAvgFR = weightedSum / totalInterval;

  // Calculate the variance of frame rate
  const variance =
    FRs.reduce((sum, rate) => sum + Math.pow(rate - weightedAvgFR, 2), 0) /
    (FRs.length - 1);

  const min = Math.min(...FRs);

  return { avg: Math.round(weightedAvgFR), variance, min };
}
