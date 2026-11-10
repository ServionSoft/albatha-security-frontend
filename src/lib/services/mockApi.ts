export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function simulate<T>(fn: () => T, opts?: { delayMs?: number; errorRate?: number }) {
  const delayMs = opts?.delayMs ?? 350;
  await delay(delayMs);
  const errorRate = opts?.errorRate ?? 0;
  if (errorRate > 0 && Math.random() < errorRate) {
    throw new Error("Mock API error. Please try again.");
  }
  return fn();
}

