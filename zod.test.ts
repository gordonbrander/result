import { assertEquals } from "@std/assert";
import { z } from "zod";
import { isErr, isOk, type Result } from "./result.ts";
import { toResult } from "./zod.ts";

/** Compile-time type assertion. Asserts that T is assignable to Expected. */
type AssertAssignable<T, Expected> = T extends Expected ? true : never;

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type User = z.infer<typeof UserSchema>;

Deno.test("toResult converts successful safeParse to Ok", () => {
  const parsed = UserSchema.safeParse({ name: "Alice", age: 30 });
  const result = toResult(parsed);

  assertEquals(isOk(result), true);
  if (isOk(result)) {
    assertEquals(result.value, { name: "Alice", age: 30 });
  }
});

Deno.test("toResult converts failed safeParse to Err", () => {
  const parsed = UserSchema.safeParse({ name: 123, age: "not a number" });
  const result = toResult(parsed);

  assertEquals(isErr(result), true);
  if (isErr(result)) {
    assertEquals(result.error instanceof z.ZodError, true);
  }
});

Deno.test("toResult Ok value has correct type", () => {
  const parsed = UserSchema.safeParse({ name: "Alice", age: 30 });
  const result = toResult(parsed);

  // Compile-time: result value should be assignable to User
  if (isOk(result)) {
    const _check: AssertAssignable<typeof result.value, User> = true;
    const _user: User = result.value;
    assertEquals(_user.name, "Alice");
    assertEquals(_user.age, 30);
  }
});

Deno.test("toResult Err value has correct type", () => {
  const parsed = UserSchema.safeParse({});
  const result = toResult(parsed);

  // Compile-time: result error should be assignable to ZodError
  if (isErr(result)) {
    const _check: AssertAssignable<typeof result.error, z.ZodError> = true;
    const _error: z.ZodError = result.error;
    assertEquals(_error.issues.length > 0, true);
  }
});

Deno.test("toResult return type is Result<User, ZodError>", () => {
  const parsed = UserSchema.safeParse({ name: "Bob", age: 25 });
  const result = toResult(parsed);

  // Compile-time: result should be assignable to Result<User, ZodError>
  const _check: AssertAssignable<
    typeof result,
    Result<User, z.ZodError>
  > = true;
  void _check;
});

Deno.test("toResult preserves all fields on successful parse", () => {
  const schema = z.object({
    id: z.number(),
    tags: z.array(z.string()),
    active: z.boolean(),
  });

  const input = { id: 1, tags: ["a", "b"], active: true };
  const result = toResult(schema.safeParse(input));

  assertEquals(isOk(result), true);
  if (isOk(result)) {
    assertEquals(result.value, input);
  }
});

Deno.test("toResult error contains issue details for invalid input", () => {
  const result = toResult(UserSchema.safeParse({}));

  assertEquals(isErr(result), true);
  if (isErr(result)) {
    const paths = result.error.issues.map((i) => i.path[0]);
    assertEquals(paths.includes("name"), true);
    assertEquals(paths.includes("age"), true);
  }
});

Deno.test("toResult works with primitive schemas", () => {
  const schema = z.string();

  const okResult = toResult(schema.safeParse("hello"));
  assertEquals(isOk(okResult), true);
  if (isOk(okResult)) {
    assertEquals(okResult.value, "hello");
  }

  const errResult = toResult(schema.safeParse(42));
  assertEquals(isErr(errResult), true);
});
