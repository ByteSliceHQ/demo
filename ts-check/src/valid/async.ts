/**
 * Async / Promise helpers: deferred, retry with typed results, and a
 * settled-result union.
 */

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export type Settled<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  try {
    return { status: "fulfilled", value: await promise };
  } catch (reason) {
    return { status: "rejected", reason };
  }
}

export interface RetryOptions {
  attempts: number;
  delayMs: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  { attempts, delayMs }: RetryOptions,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts && delayMs > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

export function delay(ms: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
}

export async function demo(): Promise<Settled<string>> {
  return settle(delay(1).then((ms) => `waited ${ms}ms`));
}
