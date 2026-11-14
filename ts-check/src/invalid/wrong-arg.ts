/**
 * Invalid case: wrong argument type passed to a function.
 */

export function double(value: number): number {
  return value * 2;
}

export const result = double("42"); // TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
