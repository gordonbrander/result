# Result

Typescript functions for working with Rust-like Result and Option types.

- Option is modeled as type of `T | undefined`, with some helpers for coalescing nullish values.
- Result is modeled as `{ ok: true, value: T } | { ok: false, error: E }`, in keeping with common conventions used in REST APIs.
