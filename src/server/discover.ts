/**
 * Discover — the public directory API.
 *
 * GET /api/discover → published, explicitly discoverable identities as JSON.
 *
 * Only published manifests with discoverable === true are listed — opt-in at
 * the editor, never implied by publishing. Responses carry the SAFE projection
 * only; owners, principals, and anything email-shaped never leave here.
 */

import { Router } from "express";

import {
  filterEntries,
  isDiscoverable,
  renderDirectoryHtml,
  toDirectoryEntry,
} from "../lib/directory";
import { COLLECTIONS, type IdentityManifest } from "../lib/identity";
import { config } from "./config";
import { db } from "./db";
import { wrap } from "./util";

export const discover = Router();

const MAX = 60;

async function listEntries(q?: string, type?: string) {
  const rows = (await db.query(
    `FROM ${COLLECTIONS.identities} WHERE status = "published" ORDER BY updatedAt DESC LIMIT 500`,
  )) as unknown as IdentityManifest[];

  return filterEntries(
    rows.filter(isDiscoverable).map(toDirectoryEntry),
    q,
    type,
  ).slice(0, MAX);
}

function params(req: {
  query: Record<string, unknown>;
}): { q?: string; type?: string } {
  return {
    q:
      typeof req.query.q === "string"
        ? req.query.q.slice(0, 80)
        : undefined,
    type:
      typeof req.query.type === "string"
        ? req.query.type.slice(0, 20)
        : undefined,
  };
}

discover.get(
  "/api/discover",
  wrap(async (req, res) => {
    const { q, type } = params(req);
    res.json({ entries: await listEntries(q, type) });
  }),
);


export const discoverPage = wrap(async (req, res) => {
  const { q, type } = params(req);
  const entries = await listEntries(q, type);
  const origin =
    config.publicOrigin ||
    `${req.protocol}://${req.get("host") ?? "localhost"}`;

  res.setHeader("content-type", "text/html; charset=utf-8");
  res.send(
    renderDirectoryHtml(entries, {
      origin,
      brand: config.brandName,
      q,
      type,
    }),
  );
});
