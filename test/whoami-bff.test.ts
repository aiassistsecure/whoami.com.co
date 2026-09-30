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
