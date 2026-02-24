import { assertEquals } from "@std/assert";
import { isErr, isOk, type Result } from "../result.ts";
import {
  type SafeParseError,
  type SafeParseReturnType,
  type SafeParseSuccess,
  toResult,
} from "./zod.ts";

/** Compile-time type assertion. Asserts that T is assignable to Expected. */
type AssertAssignable<T, Expected> = T extends Expected ? true : never;

type User = { name: string; age: number };

const success: SafeParseSuccess<User> = {
  success: true,
  data: { name: "Alice", age: 30 },
};

const failure: SafeParseError<string> = {
  success: false,
  error: "invalid input",
};

Deno.test("toResult converts successful parse to Ok", () => {
  const result = toResult(success);

  assertEquals(isOk(result), true);
  if (isOk(result)) {
    assertEquals(result.value, { name: "Alice", age: 30 });
  }
});

Deno.test("toResult converts failed parse to Err", () => {
  const result = toResult(failure);

  assertEquals(isErr(result), true);
  if (isErr(result)) {
    assertEquals(result.error, "invalid input");
  }
});

Deno.test("toResult Ok value has correct type", () => {
  const result = toResult(success);

  if (isOk(result)) {
    const _check: AssertAssignable<typeof result.value, User> = true;
    const _user: User = result.value;
    assertEquals(_user.name, "Alice");
    assertEquals(_user.age, 30);
    void _check;
  }
});

Deno.test("toResult Err value has correct type", () => {
  const result = toResult(failure);

  if (isErr(result)) {
    const _check: AssertAssignable<typeof result.error, string> = true;
    const _error: string = result.error;
    assertEquals(_error, "invalid input");
    void _check;
  }
});

Deno.test("toResult return type is Result<User, string>", () => {
  const input: SafeParseReturnType<User, string> = success;
  const result = toResult(input);

  const _check: AssertAssignable<
    typeof result,
    Result<User, string>
  > = true;
  void _check;
});

Deno.test("toResult preserves all fields on success", () => {
  type Record = { id: number; tags: string[]; active: boolean };
  const input: SafeParseSuccess<Record> = {
    success: true,
    data: { id: 1, tags: ["a", "b"], active: true },
  };

  const result = toResult(input);

  assertEquals(isOk(result), true);
  if (isOk(result)) {
    assertEquals(result.value, { id: 1, tags: ["a", "b"], active: true });
  }
});

Deno.test("toResult works with primitive data types", () => {
  const okResult = toResult({ success: true, data: "hello" } as const);
  assertEquals(isOk(okResult), true);
  if (isOk(okResult)) {
    assertEquals(okResult.value, "hello");
  }

  const errResult = toResult({
    success: false,
    error: 42,
  } as SafeParseError<number>);
  assertEquals(isErr(errResult), true);
  if (isErr(errResult)) {
    assertEquals(errResult.error, 42);
  }
});

Deno.test("toResult works with structured error types", () => {
  type ValidationError = { field: string; message: string };
  const input: SafeParseError<ValidationError[]> = {
    success: false,
    error: [
      { field: "name", message: "required" },
      { field: "age", message: "must be a number" },
    ],
  };

  const result = toResult(input);

  assertEquals(isErr(result), true);
  if (isErr(result)) {
    assertEquals(result.error.length, 2);
    assertEquals(result.error[0].field, "name");
    assertEquals(result.error[1].field, "age");
  }
});
