/**
 * Invalid case: assignment of an incompatible type.
 * The comment on the offending line names the expected error code.
 */

export const count: number = "not a number"; // TS2322: Type 'string' is not assignable to type 'number'.
