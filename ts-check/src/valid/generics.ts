/**
 * Generics spot-check: identity, constraints, keyed access, and a small
 * generic container type.
 */

export function identity<T>(value: T): T {
  return value;
}

export interface HasId {
  id: string;
}

/** Constrained generic: T must at least carry an `id`. */
export function idOf<T extends HasId>(entity: T): string {
  return entity.id;
}

/** keyof-based accessor. */
export function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

/** Generic container with a mapping method. */
export class Box<T> {
  constructor(private readonly value: T) {}

  get(): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Box<U> {
    return new Box(fn(this.value));
  }
}

// Compile-time usage checks.
export const numeric: number = identity(42);
export const keyed: string = pluck({ name: "ada", age: 36 }, "name");
export const boxed: Box<string> = new Box(1).map((n) => `n=${n}`);
