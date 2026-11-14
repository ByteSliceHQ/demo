/**
 * Invalid case: accessing a property that does not exist on the type.
 */

export interface Point {
  x: number;
  y: number;
}

export const origin: Point = { x: 0, y: 0 };
export const depth = origin.z; // TS2339: Property 'z' does not exist on type 'Point'.
