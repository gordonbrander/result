/**
 * @file Tools for working with Result type
 */

import type { Option } from "./option.ts";

/** A successful result */
export type Ok<T> = { ok: true; value: T };

/** A failure result */
export type Err<E> = { ok: false; error: E };

/** A Result is either an Ok value or Err value */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Creates a Result type with a value
 * @returns A Result containing the value as ok
 */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/**
 * Creates a Result type with an error value
 * @returns A Result containing the value as error
 */
export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/** Is value Ok? */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result.ok === true;

/** Is value Err? */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  result.ok === false;

/**
 * Unwrap Result, throwing a TypeError if the Result is not Ok.
 * The result's error will be used as the cause for the TypeError.
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.value;
  }
  throw new TypeError(`Result is an error`, { cause: result.error });
};

/** Unwrap Result, or fall back to a default value if Err. */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  isOk(result) ? result.value : defaultValue;

/**
 * Unwrap Result, or fall back to a default value generated with a function if Err.
 * `defaultValue` function receives the error value, and can use it to generate the default.
 */
export const unwrapOrElse = <T, E>(
  result: Result<T, E>,
  defaultValue: (error: E) => T,
): T => (isOk(result) ? result.value : defaultValue(result.error));

/** Map result Ok value */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (isOk(result) ? ok(fn(result.value)) : err(result.error));

/** Map result Ok value, or fall back to a default value if Err. */
export const mapOr = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
  defaultValue: U,
): U => (isOk(result) ? fn(result.value) : defaultValue);

/**
 * Map result Ok value, or fall back to a default value generated with a function if Err.
 * `defaultValue` function receives the error value, and can use it to generate the default.
 */
export const mapOrElse = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
  defaultValue: (error: E) => U,
): U => (isOk(result) ? fn(result.value) : defaultValue(result.error));

/**
 * Map a result, returning a new result with the same error type.
 * @returns flattened result
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => Result<U, E>,
): Result<U, E> => (result.ok ? transform(result.value) : result);

/** Map Err value */
export const mapErr = <T, E, U>(
  result: Result<T, E>,
  fn: (error: E) => U,
): Result<T, U> => (isErr(result) ? err(fn(result.error)) : ok(result.value));

/**
 * Pipe a result through a series of functions that produce a result.
 * Each function returns a new result, and must share the same error type.
 * Shortcuts at first error.
 */
export function pipe<T0, E>(value: Result<T0, E>): Result<T0, E>;
export function pipe<T0, T1, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
): Result<T1, E>;
export function pipe<T0, T1, T2, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
  fn2: (value: T1) => Result<T2, E>,
): Result<T2, E>;
export function pipe<T0, T1, T2, T3, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
  fn2: (value: T1) => Result<T2, E>,
  fn3: (value: T2) => Result<T3, E>,
): Result<T3, E>;
export function pipe<T0, T1, T2, T3, T4, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
  fn2: (value: T1) => Result<T2, E>,
  fn3: (value: T2) => Result<T3, E>,
  fn4: (value: T3) => Result<T4, E>,
): Result<T4, E>;
export function pipe<T0, T1, T2, T3, T4, T5, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
  fn2: (value: T1) => Result<T2, E>,
  fn3: (value: T2) => Result<T3, E>,
  fn4: (value: T3) => Result<T4, E>,
  fn5: (value: T4) => Result<T5, E>,
): Result<T5, E>;
export function pipe<T0, T1, T2, T3, T4, T5, T6, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
  fn2: (value: T1) => Result<T2, E>,
  fn3: (value: T2) => Result<T3, E>,
  fn4: (value: T3) => Result<T4, E>,
  fn5: (value: T4) => Result<T5, E>,
  fn6: (value: T5) => Result<T6, E>,
): Result<T6, E>;
export function pipe<T0, T1, T2, T3, T4, T5, T6, T7, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
  fn2: (value: T1) => Result<T2, E>,
  fn3: (value: T2) => Result<T3, E>,
  fn4: (value: T3) => Result<T4, E>,
  fn5: (value: T4) => Result<T5, E>,
  fn6: (value: T5) => Result<T6, E>,
  fn7: (value: T6) => Result<T7, E>,
): Result<T7, E>;
export function pipe<T0, T1, T2, T3, T4, T5, T6, T7, T8, E>(
  value: Result<T0, E>,
  fn1: (value: T0) => Result<T1, E>,
  fn2: (value: T1) => Result<T2, E>,
  fn3: (value: T2) => Result<T3, E>,
  fn4: (value: T3) => Result<T4, E>,
  fn5: (value: T4) => Result<T5, E>,
  fn6: (value: T5) => Result<T6, E>,
  fn7: (value: T6) => Result<T7, E>,
  fn8: (value: T7) => Result<T8, E>,
): Result<T8, E>;
export function pipe(
  value: Result<unknown, unknown>,
  ...fns: Array<(value: unknown) => Result<unknown, unknown>>
): Result<unknown, unknown>;
export function pipe(
  value: Result<unknown, unknown>,
  ...fns: Array<(value: unknown) => Result<unknown, unknown>>
): Result<unknown, unknown> {
  let res = value;
  if (!res.ok) return res;
  for (const fn of fns) {
    res = fn(res.value);
    if (!res.ok) return res;
  }
  return res;
}

/** Convert Result to Option. Ok gets unwrapped, and Err becomes undefined. */
export const toOption = <T, E>(result: Result<T, E>): Option<T> =>
  isOk(result) ? result.value : undefined;

/**
 * Perform a throwing function and return a Result
 * @param fn - The function to perform
 * @returns A Result containing either the value or the error that was thrown
 */
export const perform = <T, E>(fn: () => T): Result<T, E> => {
  try {
    return ok(fn());
  } catch (error) {
    return err(error as E);
  }
};

/**
 * Perform an async throwing function and return a promise for a Result
 * @param fn - The function to perform
 * @returns A Result containing either the value or the error that was thrown
 */
export const performAsync = async <T, E>(
  fn: () => T,
): Promise<Result<T, E>> => {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error as E);
  }
};
