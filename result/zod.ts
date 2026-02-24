import { err, ok, type Result } from "../result.ts";

export type SafeParseSuccess<T> = {
  success: true;
  data: T;
  error?: never;
};
export type SafeParseError<E> = {
  success: false;
  error: E;
  data?: never;
};

export type SafeParseReturnType<T, E> = SafeParseSuccess<T> | SafeParseError<E>;

/** Convert a Zod `.safeParse()` result into a Result */
export const toResult = <T, E>(
  safeParseResult: SafeParseReturnType<T, E>,
): Result<NonNullable<T>, NonNullable<E>> => {
  if (!safeParseResult.success) {
    return err(safeParseResult.error as E) as Result<
      NonNullable<T>,
      NonNullable<E>
    >;
  }
  return ok(safeParseResult.data as T) as Result<
    NonNullable<T>,
    NonNullable<E>
  >;
};
