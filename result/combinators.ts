/**
 * @file Data-last curried combinators for Result
 *
 * Each combinator takes its function/value arguments first and returns
 * a function that accepts a Result — ideal for composition and piping.
 */

import * as DataFirst from "../result.ts";
import type { Result } from "../result.ts";

/** Unwrap Result, or fall back to a default value if Err. */
export const unwrapOr = <T>(defaultValue: T) => <E>(result: Result<T, E>): T =>
  DataFirst.unwrapOr(result, defaultValue);

/** Unwrap Result, or compute a fallback from the error. */
export const unwrapOrElse =
  <T, E>(fn: (error: E) => T) => (result: Result<T, E>): T =>
    DataFirst.unwrapOrElse(result, fn);

/** Map Result Ok value. */
export const map =
  <T, U>(fn: (value: T) => U) => <E>(result: Result<T, E>): Result<U, E> =>
    DataFirst.map(result, fn);

/** Map Result Ok value, or fall back to a default value if Err. */
export const mapOr =
  <T, U>(fn: (value: T) => U, defaultValue: U) =>
  <E>(result: Result<T, E>): U => DataFirst.mapOr(result, fn, defaultValue);

/** Map Result Ok value, or compute a fallback from the error. */
export const mapOrElse =
  <T, U, E>(fn: (value: T) => U, defaultValue: (error: E) => U) =>
  (result: Result<T, E>): U => DataFirst.mapOrElse(result, fn, defaultValue);

/** FlatMap a Result, returning a new Result. */
export const flatMap =
  <T, U, E>(transform: (value: T) => Result<U, E>) =>
  (result: Result<T, E>): Result<U, E> => DataFirst.flatMap(result, transform);

/** Map Err value. */
export const mapErr =
  <E, U>(fn: (error: E) => U) => <T>(result: Result<T, E>): Result<T, U> =>
    DataFirst.mapErr(result, fn);
