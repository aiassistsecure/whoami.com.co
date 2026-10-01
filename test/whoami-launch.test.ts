import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";

import { config } from "../src/server/config";
import { createApp } from "../src/server/app";

let server: Server;
let base: string;
let priorPublicLaunch: boolean;

before(() => {
  priorPublicLaunch = config.publicLaunch;
  config.publicLaunch = true;
  server = createApp().listen(0);
  const address = server.address();
  assert.ok(address && typeof address === "object");
  base = `http://127.0.0.1:${address.port}`;
});

after(() => {
  config.publicLaunch = priorPublicLaunch;
  server?.close();
});

test("public launch exposes the WhoAmI BFF", async () => {
  const response = await fetch(`${base}/api/whoami/home`);
  assert.equal(response.status, 200);
});

test("public launch does not mount inherited Links APIs", async () => {
  for (const path of [
    "/api/admin/overview",
    "/api/identities",
    "/api/hireme/types/nope/nope",
    "/api/preview",
    "/api/billing",
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, `${path} must not exist on the public host`);
  }
});

test("public launch does not expose inherited public surfaces", async () => {
  for (const path of ["/demo", "/identities", "/edit/anything", "/some-old-handle"]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, `${path} must fail closed`);
  }
});

test("public launch health omits internal database and auth details", async () => {
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json() as Record<string, unknown>;
  assert.equal(body.app, "whoami");
  assert.equal(body.mode, "public-launch");
  assert.equal("db" in body, false);
  assert.equal("authConfigured" in body, false);
});

test("public launch does not grant cross-origin browser access", async () => {
  const response = await fetch(`${base}/api/whoami/home`, {
    headers: { Origin: "https://example.net" },
  });
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.get("x-frame-options"), "DENY");
});
