import { assertEquals } from "@std/assert";
import { err, ok, type Result } from "../result.ts";
import { pipe } from "../pipe.ts";
import {
  flatMap,
  map,
  mapErr,
  mapOr,
  mapOrElse,
  unwrapOr,
  unwrapOrElse,
} from "./combinators.ts";

Deno.test("unwrapOr returns value for ok results", () => {
  const result: Result<number, string> = ok(42);
  assertEquals(unwrapOr(0)(result), 42);
});

Deno.test("unwrapOr returns default for err results", () => {
  const result: Result<number, string> = err("error");
  assertEquals(unwrapOr(0)(result), 0);
});

Deno.test("unwrapOrElse returns value for ok results", () => {
  const result: Result<number, string> = ok(42);
  assertEquals(unwrapOrElse<number, string>(() => 0)(result), 42);
});

Deno.test("unwrapOrElse returns computed default for err results", () => {
  const result: Result<number, string> = err("error");
  assertEquals(unwrapOrElse<number, string>((e) => e.length)(result), 5);
});

Deno.test("map transforms ok values", () => {
  const result: Result<number, string> = ok(42);
  assertEquals(map((x: number) => x * 2)(result), { ok: true, value: 84 });
});

Deno.test("map preserves err values", () => {
  const result: Result<number, string> = err("error");
  assertEquals(map((x: number) => x * 2)(result), {
    ok: false,
    error: "error",
  });
});

Deno.test("mapOr transforms ok values", () => {
  const result: Result<number, string> = ok(42);
  assertEquals(mapOr((x: number) => x * 2, 0)(result), 84);
});

Deno.test("mapOr returns default for err values", () => {
  const result: Result<number, string> = err("error");
  assertEquals(mapOr((x: number) => x * 2, 0)(result), 0);
});

Deno.test("mapOrElse transforms ok values", () => {
  const result: Result<number, string> = ok(42);
  assertEquals(
    mapOrElse<number, number, string>((x) => x * 2, () => 0)(result),
    84,
  );
});

Deno.test("mapOrElse returns computed default for err values", () => {
  const result: Result<number, string> = err("error");
  assertEquals(
    mapOrElse<number, number, string>((x) => x * 2, (e) => e.length)(result),
    5,
  );
});

Deno.test("flatMap transforms ok values with resulting ok", () => {
  const result: Result<number, string> = ok(42);
  assertEquals(
    flatMap<number, number, string>((x) => ok(x * 2))(result),
    { ok: true, value: 84 },
  );
});

Deno.test("flatMap preserves err values", () => {
  const result: Result<number, string> = err("error");
  assertEquals(
    flatMap<number, number, string>((x) => ok(x * 2))(result),
    { ok: false, error: "error" },
  );
});

Deno.test("mapErr transforms err values", () => {
  const result: Result<number, string> = err("error");
  assertEquals(mapErr((e: string) => e.toUpperCase())(result), {
    ok: false,
    error: "ERROR",
  });
});

Deno.test("mapErr preserves ok values", () => {
  const result: Result<number, string> = ok(42);
  assertEquals(mapErr((e: string) => e.toUpperCase())(result), {
    ok: true,
    value: 42,
  });
});

Deno.test("combinators work with pipe", () => {
  const result = pipe(
    ok(10),
    map((x: number) => x + 5),
    flatMap((x: number) => (x > 10 ? ok(x * 2) : err("too small"))),
    map((x: number) => `result: ${x}`),
  );
  assertEquals(result, { ok: true, value: "result: 30" });
});

Deno.test("combinators compose as standalone transformers", () => {
  const double = map((x: number) => x * 2);
  const results: Result<number, string>[] = [ok(1), err("fail"), ok(3)];
  assertEquals(results.map(double), [
    { ok: true, value: 2 },
    { ok: false, error: "fail" },
    { ok: true, value: 6 },
  ]);
});
