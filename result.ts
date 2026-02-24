/**
 * @file Tools for working with Result type
 */

import type { Nullish, Option } from "./option.ts";

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

/** Convert Result to Option. Ok gets unwrapped, and Err becomes undefined. */
export const toOption = <T, E>(result: Result<T, E>): Option<T> =>
  isOk(result) ? result.value : undefined;

/**
 * Perform a throwing function and return a Result
 * @param fn - The function to perform
 * @returns A Result containing either the value or the error that was thrown
 */
export const perform = <T, E = unknown>(fn: () => T): Result<T, E> => {
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
export const performAsync = async <T, E = unknown>(
  fn: () => Promise<T>,
): Promise<Result<T, E>> => {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error as E);
  }
};

/**
 * Transform two disjoint nullish values (a possible value and a possible error)
 * into a Result of optional value or error.
 *
 * This function is useful for bridging to libraries that don't have proper result
 * types with a discriminated union.
 */
export const intoResult = <T, E>(
  value: Nullish<T>,
  error: Nullish<E>,
): Result<Option<T>, E> => {
  if (error != undefined) {
    return err(error);
  }
  return ok(value ?? undefined);
};
