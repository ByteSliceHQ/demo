/**
 * Invalid case: dereferencing a possibly-undefined value under strict null checks.
 */

export interface Config {
  retries: number;
}

export function retriesFrom(maybeConfig?: Config): number {
  return maybeConfig.retries; // TS18048: 'maybeConfig' is possibly 'undefined'.
}
