import { assertEquals } from "@std/assert";
import {
  err,
  flatMap,
  isErr,
  isOk,
  map,
  mapErr,
  mapOr,
  mapOrElse,
  ok,
  perform,
  type Result,
  toOption,
  unwrap,
  unwrapOr,
  unwrapOrElse,
} from "./result.ts";

Deno.test("ok creates an ok result", () => {
  const result = ok(42);
  assertEquals(result, { ok: true, value: 42 });
});

Deno.test("err creates an error result", () => {
  const result = err("error");
  assertEquals(result, { ok: false, error: "error" });
});

Deno.test("isOk returns true for ok values", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  assertEquals(isOk(result), true);
});

Deno.test("isOk returns false for err values", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  assertEquals(isOk(result), false);
});

Deno.test("isErr returns true for err values", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  assertEquals(isErr(result), true);
});

Deno.test("isErr returns false for ok values", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  assertEquals(isErr(result), false);
});

Deno.test("unwrap returns value for ok results", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  assertEquals(unwrap(result), 42);
});

Deno.test("unwrap throws for err results", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  try {
    unwrap(result);
    throw new Error("Expected unwrap to throw");
  } catch (e) {
    const error = e as Error;
    assertEquals(error.cause, "error");
  }
});

Deno.test("unwrapOr returns value for ok results", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  assertEquals(unwrapOr(result, 0), 42);
});

Deno.test("unwrapOr returns default for err results", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  assertEquals(unwrapOr(result, 0), 0);
});

Deno.test("unwrapOrElse returns value for ok results", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  assertEquals(
    unwrapOrElse(result, () => 0),
    42,
  );
});

Deno.test("unwrapOrElse returns computed default for err results", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  assertEquals(
    unwrapOrElse(result, () => 0),
    0,
  );
});

Deno.test("map transforms ok values", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  const mapped = map(result, (x) => x * 2);
  assertEquals(mapped, { ok: true, value: 84 });
});

Deno.test("map preserves err values", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  const mapped = map<number, number, string>(result, (x) => x * 2);
  assertEquals(mapped, { ok: false, error: "error" });
});

Deno.test("mapOr transforms ok values", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  const mapped = mapOr(result, (x) => x * 2, 0);
  assertEquals(mapped, 84);
});

Deno.test("mapOr returns default for err values", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  const mapped = mapOr<number, number, string>(result, (x) => x * 2, 0);
  assertEquals(mapped, 0);
});

Deno.test("mapOrElse transforms ok values", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  const mapped = mapOrElse(
    result,
    (x) => x * 2,
    () => 0,
  );
  assertEquals(mapped, 84);
});

Deno.test("mapOrElse returns computed default for err values", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  const mapped = mapOrElse<number, number, string>(
    result,
    (x) => x * 2,
    () => 0,
  );
  assertEquals(mapped, 0);
});

Deno.test("mapErr transforms err values", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  const mapped = mapErr<number, string, string>(result, (e) => e.toUpperCase());
  assertEquals(mapped, { ok: false, error: "ERROR" });
});

Deno.test("mapErr preserves ok values", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  const mapped = mapErr<number, string, string>(result, (e) => e.toUpperCase());
  assertEquals(mapped, { ok: true, value: 42 });
});

Deno.test("toOption returns value for ok results", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  assertEquals(toOption(result), 42);
});

Deno.test("toOption returns null for err results", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  assertEquals(toOption(result), undefined);
});

Deno.test("perform returns ok for successful function", () => {
  const result = perform(() => 42);
  assertEquals(result, { ok: true, value: 42 });
});

Deno.test("perform returns err for throwing function", () => {
  const error = new Error("test error");
  const result = perform(() => {
    throw error;
  });
  assertEquals(result, { ok: false, error: error });
});

Deno.test("flatMap transforms ok values with resulting ok", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  const flatMapped = flatMap(result, (x) => ok(x * 2));
  assertEquals(flatMapped, { ok: true, value: 84 });
});

Deno.test("flatMap transforms ok values with resulting err", () => {
  const result: Result<number, string> = { ok: true, value: 42 };
  const flatMapped = flatMap<number, number, string>(
    result,
    () => err("error"),
  );
  assertEquals(flatMapped, { ok: false, error: "error" });
});

Deno.test("flatMap preserves err values", () => {
  const result: Result<number, string> = { ok: false, error: "error" };
  const flatMapped = flatMap<number, number, string>(result, (x) => ok(x * 2));
  assertEquals(flatMapped, { ok: false, error: "error" });
});
