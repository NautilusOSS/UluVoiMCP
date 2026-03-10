import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toolResult, toolError, wrapHandler } from "../lib/errors.js";

describe("toolResult", () => {
  it("wraps data as JSON text content", () => {
    const r = toolResult({ foo: 1 });
    assert.equal(r.content.length, 1);
    assert.equal(r.content[0].type, "text");
    assert.deepEqual(JSON.parse(r.content[0].text), { foo: 1 });
  });
});

describe("toolError", () => {
  it("returns isError with JSON error message", () => {
    const r = toolError("something broke");
    assert.equal(r.isError, true);
    assert.deepEqual(JSON.parse(r.content[0].text), { error: "something broke" });
  });
});

describe("wrapHandler", () => {
  it("passes through successful results", async () => {
    const handler = wrapHandler(async () => toolResult({ ok: true }));
    const result = await handler({});
    assert.equal(result.isError, undefined);
    assert.deepEqual(JSON.parse(result.content[0].text), { ok: true });
  });

  it("catches thrown errors and returns toolError", async () => {
    const handler = wrapHandler(async () => {
      throw new Error("boom");
    });
    const result = await handler({});
    assert.equal(result.isError, true);
    assert.deepEqual(JSON.parse(result.content[0].text), { error: "boom" });
  });

  it("handles non-Error throws", async () => {
    const handler = wrapHandler(async () => {
      throw "string error";
    });
    const result = await handler({});
    assert.equal(result.isError, true);
    assert.deepEqual(JSON.parse(result.content[0].text), { error: "string error" });
  });
});
