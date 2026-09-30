import { Router } from "express";

import type { DiscoverView, OfferDraft, SocialPlatform } from "../lib/whoami/contracts";
import { discoverView, homeView, profileViews } from "../lib/whoami/mock";

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

whoami.get("/creators/:handle", (req, res) => {
  const handle = req.params.handle.toLowerCase();
  const profile = profileViews[handle];
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
