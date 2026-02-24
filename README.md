# @gordonb/result

Typescript functions for working with Rust-like Result and Option types.

The package is written in a pragmatic functional style: just plain data and
functions. Result is `{ ok: true, value: T } | { ok: false, error: E }`. Option
is `T | undefined`. The rest of the library is just simple utility and
combinator functions. No wrapper classes, no methods.

## Install

Deno:

```sh
deno add jsr:@gordonb/result
```

## Quick example

```ts
import { Option, Result } from "@gordonb/result";

// Result
const parsed = Result.perform(() => JSON.parse(input));
const name = Result.map(parsed, (data) => data.name);
const greeting = Result.unwrapOr(name, "stranger");

// Option
const first: string | undefined = items[0];
const upper = Option.map(first, (s) => s.toUpperCase());
const display = Option.unwrapOr(upper, "(empty)");
```

## Result

```ts
import * as Result from "@gordonb/result/result";
```

### Types

```ts
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;
```

### Factory functions

```ts
ok<T>(value: T): Result<T, never>
err<E>(error: E): Result<never, E>
```

```ts
Result.ok(42); // { ok: true, value: 42 }
Result.err("!"); // { ok: false, error: "!" }
```

### Type guards

```ts
isOk<T, E>(result: Result<T, E>): result is Ok<T>
isErr<T, E>(result: Result<T, E>): result is Err<E>
```

Both are type-narrowing guards that work with `if` statements and
`Array.filter`.

### Unwrapping

```ts
unwrap<T, E>(result: Result<T, E>): T
```

Returns the Ok value, or throws a `TypeError` with the error as `cause`.

```ts
unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T
```

Returns the Ok value, or falls back to `defaultValue`.

```ts
unwrapOrElse<T, E>(result: Result<T, E>, defaultValue: (error: E) => T): T
```

Returns the Ok value, or computes a fallback from the error.

### Transformations

```ts
map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>
```

Transforms the Ok value. Err passes through unchanged.

```ts
mapOr<T, U, E>(result: Result<T, E>, fn: (value: T) => U, defaultValue: U): U
```

Transforms the Ok value, or returns `defaultValue` if Err.

```ts
mapOrElse<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
  defaultValue: (error: E) => U,
): U
```

Transforms the Ok value, or computes a fallback from the error.

```ts
flatMap<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => Result<U, E>,
): Result<U, E>
```

Transforms the Ok value with a function that itself returns a Result, then
flattens. Useful for chaining operations that can fail.

```ts
mapErr<T, E, U>(result: Result<T, E>, fn: (error: E) => U): Result<T, U>
```

Transforms the Err value. Ok passes through unchanged.

### Conversion

```ts
toOption<T, E>(result: Result<T, E>): Option<T>
```

Converts a Result to an Option. Ok is unwrapped, Err becomes `undefined`.

### Error capture

```ts
perform<T, E = unknown>(fn: () => T): Result<T, E>
```

Runs a throwing function and captures the outcome as a Result.

```ts
Result.perform(() => JSON.parse(input));
// Ok with parsed value, or Err with the SyntaxError
```

```ts
performAsync<T, E = unknown>(fn: () => Promise<T>): Promise<Result<T, E>>
```

Async version of `perform`.

```ts
await Result.performAsync(() => fetch(url).then((r) => r.json()));
```

### Bridging

```ts
intoResult<T, E>(value: Nullish<T>, error: Nullish<E>): Result<Option<T>, E>
```

Converts two disjoint nullish values (a possible value and a possible error)
into a proper Result. Useful for bridging libraries that return separate
value/error pairs instead of a discriminated union.

```ts
const { data, error } = await supabase.from("users").select();
const result = Result.intoResult(data, error);
```

### Bridging with Zod

```ts
import { toResult } from "@gordonb/result/zod";
```

Converts a Zod `safeParse` result into a `Result<T, ZodError>`.

```ts
import { z } from "zod";

const User = z.object({ name: z.string(), age: z.number() });

const result = toResult(User.safeParse(input));
// Ok with parsed User, or Err with ZodError
```

The `zod` module re-declares Zod's `SafeParseReturnType` locally, so it has no
runtime dependency on Zod. Any object matching the `{ success, data, error }`
shape will work.

## Option

Option is modeled as `T | undefined`, with helpers for coalescing nullish values
and transforming optional data.

```ts
import * as Option from "@gordonb/result/option";
```

### Types

```ts
type Option<T> = T | undefined;
type Nullish<T> = T | null | undefined;
```

### Constructor

```ts
from<T>(value: Nullish<T>): Option<T>
```

Creates an Option from a nullish value. Coalesces `null` to `undefined`.

```ts
Option.from(null); // undefined
Option.from(42); // 42
```

### Type guards

```ts
isSome<T>(value: Option<T>): value is T
isNone(value: unknown): value is undefined
isNullish(value: unknown): value is null | undefined
```

`isNullish` is broader than `isNone` - it matches both `null` and `undefined`.

### Unwrapping

```ts
unwrap<T>(value: Option<T>): T
```

Returns the value, or throws a `TypeError` if `undefined`.

```ts
unwrapOr<T>(value: Option<T>, defaultValue: T): T
```

Returns the value, or falls back to `defaultValue`.

```ts
unwrapOrElse<T>(value: Option<T>, fn: () => T): T
```

Returns the value, or computes a fallback.

### Transformations

```ts
map<T, U>(value: Option<T>, fn: (value: T) => Option<U>): Option<U>
```

Transforms the value if Some. Returns `undefined` if None.

```ts
mapOr<T, U>(value: Option<T>, defaultValue: U, fn: (value: T) => U): U
```

Transforms the value if Some, or returns `defaultValue` if None.

```ts
mapOrElse<T, U>(value: Option<T>, fn: () => U, defaultValue: U): U
```

Calls `fn` if Some, or returns `defaultValue` if None.

## Combinators

Data-last curried versions of each function, designed for `pipe` and standalone
use. Each combinator takes its configuration arguments first and returns a
function that accepts the data.

### Result combinators

```ts
import * as Result from "@gordonb/result/result";
import * as RC from "@gordonb/result/result/combinators";
import { pipe } from "@gordonb/result/pipe";

const result = pipe(
  Result.ok(10),
  RC.map((x: number) => x + 5),
  RC.flatMap((
    x: number,
  ) => (x > 10 ? Result.ok(x * 2) : Result.err("too small"))),
  RC.map((x: number) => `result: ${x}`),
);
// { ok: true, value: "result: 30" }
```

Available combinators: `unwrapOr`, `unwrapOrElse`, `map`, `mapOr`, `mapOrElse`,
`flatMap`, `mapErr`.

Combinators also work as standalone transformers:

```ts
const double = RC.map((x: number) => x * 2);
[Result.ok(1), Result.err("fail"), Result.ok(3)].map(double);
// [{ ok: true, value: 2 }, { ok: false, error: "fail" }, { ok: true, value: 6 }]
```

### Option combinators

```ts
import * as Option from "@gordonb/result/option";
import * as OC from "@gordonb/result/option/combinators";
import { pipe } from "@gordonb/result/pipe";

const display = pipe(
  42 as Option.Option<number>,
  OC.map((x: number) => x + 8),
  OC.map((x: number) => `value: ${x}`),
  OC.unwrapOr("none"),
);
// "value: 50"
```

Available combinators: `unwrapOr`, `unwrapOrElse`, `map`, `mapOr`, `mapOrElse`.

## Pipe utilities

Re-exported from [`@gordonb/pipe`](https://jsr.io/@gordonb/pipe) for
convenience:

```ts
import { flow, flowAsync, pipe, pipeAsync } from "@gordonb/result/pipe";
```

- `pipe(value, ...fns)` - Thread a value through a series of functions
- `flow(...fns)` - Compose functions left-to-right (returns a new function)
- `pipeAsync(value, ...fns)` - Async version of `pipe`
- `flowAsync(...fns)` - Async version of `flow`

## License

MIT
