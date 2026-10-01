import { createHash } from "node:crypto";
import { Router } from "express";

import type { CreatorProfileView, DiscoverView, OfferDraft, SocialPlatform, WaitlistJoinInput, WaitlistRole } from "../lib/whoami/contracts";
import { discoverView, homeView, profileViews } from "../lib/whoami/mock";
import { causalParent, db } from "./db";

export const whoami = Router();

whoami.get("/home", (_req, res) => {
  res.json(homeView);
});

whoami.get("/discover", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
  const platform =
    typeof req.query.platform === "string"
      ? (req.query.platform as SocialPlatform)
      : undefined;

  const creators = discoverView.creators.filter((creator) => {
    const matchesQuery =
      !q ||
      creator.handle.toLowerCase().includes(q) ||
      creator.displayName.toLowerCase().includes(q) ||
      creator.category.toLowerCase().includes(q) ||
      creator.location.toLowerCase().includes(q);
    const matchesPlatform = !platform || creator.platform === platform;
    return matchesQuery && matchesPlatform;
  });

  const view: DiscoverView = {
    ...discoverView,
    query: q,
    filters: { ...discoverView.filters, platform },
    creators,
  };

  res.json(view);
});

function creatorProfile(identity: string): CreatorProfileView | undefined {
  return profileViews[identity.trim().toLowerCase()];
}

whoami.get("/preview", (req, res) => {
  const identity =
    typeof req.query.identity === "string"
      ? req.query.identity
      : "";
  const profile = creatorProfile(identity);
  if (!profile) {
    res.status(404).json({ error: "creator preview not found" });
    return;
  }
  res.json(profile);
});

whoami.get("/creators/:handle", (req, res) => {
  const profile = creatorProfile(req.params.handle);
  if (!profile) {
    res.status(404).json({ error: "creator not found" });
    return;
  }
  res.json(profile);
});

whoami.post("/offers", (req, res) => {
  const body = req.body as Partial<OfferDraft>;
  if (
    !body.creatorHandle ||
    !body.platform ||
    !body.placement ||
    !body.mediaType ||
    typeof body.listedPrice !== "number" ||
    typeof body.amount !== "number"
  ) {
    res.status(400).json({ error: "invalid offer" });
    return;
  }

  res.status(201).json({
    offer: {
      ...body,
      id: "offer_mock_001",
      status: "sent",
    },
  });
});


function normalizedWaitlistRole(value: unknown): WaitlistRole | null {
  return value === "creator" || value === "brand" || value === "both" ? value : null;
}

whoami.post("/waitlist", async (req, res) => {
  const body = req.body as Partial<WaitlistJoinInput>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = normalizedWaitlistRole(body.role);
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 80) : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role || !source) {
    res.status(400).json({ error: "invalid waitlist signup" });
    return;
  }

  const id = createHash("sha256").update(email).digest("hex").slice(0, 32);
  const existing = await db.get("whoami_waitlist", id);
  const now = new Date().toISOString();
  const existingRole = existing && typeof existing.role === "string" ? existing.role : undefined;
  const mergedRole: WaitlistRole =
    existingRole && existingRole !== role ? "both" : role;
  const existingSources =
    existing && Array.isArray(existing.sources)
      ? existing.sources.filter((value): value is string => typeof value === "string")
      : [];
  const sources = Array.from(new Set([...existingSources, source]));

  await db.put(
    "whoami_waitlist",
    id,
    {
      email,
      role: mergedRole,
      sources,
      firstSeenAt:
        existing && typeof existing.firstSeenAt === "string"
          ? existing.firstSeenAt
          : now,
      updatedAt: now,
      status: "active",
    },
    { causedBy: causalParent(existing) },
  );

  res.status(existing ? 200 : 201).json({
    ok: true,
    status: existing ? "already_joined" : "joined",
  });
});
