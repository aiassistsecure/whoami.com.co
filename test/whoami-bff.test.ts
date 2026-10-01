import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";

const { createApp } = await import("../src/server/app");

let server: Server;
let base: string;

before(() => {
  server = createApp().listen(0);
  const addr = server.address();
  assert.ok(addr && typeof addr === "object");
  base = `http://127.0.0.1:${addr.port}`;
});

after(() => server?.close());

test("WhoAmI by The Agency BFF serves the approved home model", async () => {
  const r = await fetch(`${base}/api/whoami/home`);
  assert.equal(r.status, 200);
  const j = await r.json() as { hero: { title: string; subtitle: string }; featuredCreators: unknown[] };
  assert.equal(j.hero.title, "Everyone's social media has value.");
  assert.equal(j.hero.subtitle, "What's your price?");
  assert.ok(j.featuredCreators.length >= 3);
});

test("WhoAmI by The Agency creator profile exposes video/photo rate pairs", async () => {
  const r = await fetch(`${base}/api/whoami/creators/interchained`);
  assert.equal(r.status, 200);
  const j = await r.json() as { rates: { post: { video: number; photo: number } } };
  assert.equal(j.rates.post.video, 100);
  assert.equal(j.rates.post.photo, 125);
});

test("WhoAmI by The Agency discover filters by platform", async () => {
  const r = await fetch(`${base}/api/whoami/discover?platform=x`);
  const j = await r.json() as { creators: Array<{ platform: string }> };
  assert.ok(j.creators.length > 0);
  assert.ok(j.creators.every((c) => c.platform === "x"));
});


test("WhoAmI waitlist persists signup intent and deduplicates by email", async () => {
  const body = {
    email: "waitlist-bff@example.com",
    role: "creator",
    source: "test",
  };

  const first = await fetch(`${base}/api/whoami/waitlist`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  assert.ok(first.status === 200 || first.status === 201);
  const firstJson = await first.json() as { ok: boolean; status: string };
  assert.equal(firstJson.ok, true);
  assert.ok(firstJson.status === "joined" || firstJson.status === "already_joined");

  const second = await fetch(`${base}/api/whoami/waitlist`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, role: "brand", source: "test-second" }),
  });
  assert.equal(second.status, 200);
  const secondJson = await second.json() as { ok: boolean; status: string };
  assert.equal(secondJson.ok, true);
  assert.equal(secondJson.status, "already_joined");
});

test("WhoAmI waitlist rejects malformed signup data", async () => {
  const r = await fetch(`${base}/api/whoami/waitlist`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "not-an-email", role: "creator", source: "test" }),
  });
  assert.equal(r.status, 400);
});


test("WhoAmI preview resolves featured identity from query args", async () => {
  const r = await fetch(`${base}/api/whoami/preview?identity=tylerp`);
  assert.equal(r.status, 200);
  const j = await r.json() as { handle: string; displayName: string };
  assert.equal(j.handle, "tylerp");
  assert.equal(j.displayName, "Tyler");
});

test("WhoAmI preview returns 404 for an unknown identity", async () => {
  const r = await fetch(`${base}/api/whoami/preview?identity=does-not-exist`);
  assert.equal(r.status, 404);
});
