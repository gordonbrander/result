import { assertEquals } from "@std/assert";
import type { Option } from "../option.ts";
import { pipe } from "../pipe.ts";
import {
  map,
  mapOr,
  mapOrElse,
  unwrapOr,
  unwrapOrElse,
} from "./combinators.ts";

Deno.test("unwrapOr returns value for Some", () => {
  const value: Option<number> = 42;
  assertEquals(unwrapOr(0)(value), 42);
});

Deno.test("unwrapOr returns default for None", () => {
  const value: Option<number> = undefined;
  assertEquals(unwrapOr(0)(value), 0);
});

Deno.test("unwrapOrElse returns value for Some", () => {
  const value: Option<number> = 42;
  assertEquals(unwrapOrElse(() => 0)(value), 42);
});

Deno.test("unwrapOrElse returns computed default for None", () => {
  const value: Option<number> = undefined;
  assertEquals(unwrapOrElse(() => 99)(value), 99);
});

Deno.test("map transforms Some values", () => {
  const value: Option<number> = 42;
  assertEquals(map((x: number) => x * 2)(value), 84);
});

Deno.test("map returns undefined for None", () => {
  const value: Option<number> = undefined;
  assertEquals(map((x: number) => x * 2)(value), undefined);
});

Deno.test("mapOr transforms Some values", () => {
  const value: Option<number> = 42;
  assertEquals(mapOr(0, (x: number) => x * 2)(value), 84);
});

Deno.test("mapOr returns default for None", () => {
  const value: Option<number> = undefined;
  assertEquals(mapOr(0, (x: number) => x * 2)(value), 0);
});

Deno.test("mapOrElse calls fn for Some", () => {
  const value: Option<number> = 42;
  assertEquals(mapOrElse(() => 99, 0)(value), 99);
});

Deno.test("mapOrElse returns default for None", () => {
  const value: Option<number> = undefined;
  assertEquals(mapOrElse(() => 99, 0)(value), 0);
});

Deno.test("combinators compose as standalone transformers", () => {
  const double = map((x: number) => x * 2);
  const values: Option<number>[] = [1, undefined, 3];
  assertEquals(values.map(double), [2, undefined, 6]);
});

Deno.test("combinators work with pipe", () => {
  const result = pipe(
    42 as Option<number>,
    map((x: number) => x + 8),
    map((x: number) => `value: ${x}`),
    unwrapOr("none"),
  );
  assertEquals(result, "value: 50");
});
