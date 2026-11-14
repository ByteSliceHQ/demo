# ts-check

A small TypeScript spot-check that verifies the compiler accepts a set of
**valid** files and rejects a set of **invalid** files with the expected
diagnostic codes.

## Layout

```
ts-check/
  package.json
  tsconfig.json          # strict; includes only src/valid/**/*.ts
  tsconfig.invalid.json  # strict; includes only src/invalid/**/*.ts
  src/
    valid/
      generics.ts        # generics, constraints, keyof access, generic container
      unions.ts          # discriminated unions + narrowing, type guard
      enums-classes.ts   # enums, classes, access modifiers, interface impl
      async.ts           # async/Promise helpers (deferred, settle, retry)
    invalid/
      type-mismatch.ts       # TS2322
      wrong-arg.ts           # TS2345
      missing-property.ts    # TS2339
      possibly-undefined.ts  # TS18048
```

Each file under `src/invalid/` contains exactly one deliberate type error, and
the offending line carries a comment naming the expected error code.

## Usage

```bash
npm install
```

### Valid files — must pass (exit code 0)

```bash
npm run check
# tsc --noEmit -p tsconfig.json
```

### Invalid files — must fail (non-zero exit code)

```bash
npm run check:invalid
# tsc --noEmit -p tsconfig.invalid.json
```

## Expected results

- `npm run check` exits `0` and prints nothing.
- `npm run check:invalid` exits non-zero and reports **one error per invalid
  file** (four errors total), with the codes listed above. The presence of the
  named code in the output is what makes the check meaningful — the invalid
  project is expected to fail.

`node_modules/` is git-ignored; TypeScript is installed as a devDependency.
