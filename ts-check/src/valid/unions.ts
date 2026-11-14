/**
 * Interfaces + discriminated unions with exhaustive narrowing.
 */

export interface Circle {
  kind: "circle";
  radius: number;
}

export interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

export interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

export type Shape = Circle | Rectangle | Triangle;

export function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
    default:
      // Exhaustiveness check: `never` if every variant is handled.
      return assertNever(shape);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled shape: ${JSON.stringify(value)}`);
}

/** `in`-based narrowing across two structurally different unions. */
export interface WithEmail {
  email: string;
}

export interface WithPhone {
  phone: string;
}

export type Contact = WithEmail | WithPhone;

export function describe(contact: Contact): string {
  if ("email" in contact) {
    return `email:${contact.email}`;
  }
  return `phone:${contact.phone}`;
}

/** Optional-field narrowing via a user-defined type guard. */
export interface MaybeName {
  name?: string;
}

export function hasName(input: MaybeName): input is { name: string } {
  return typeof input.name === "string";
}
