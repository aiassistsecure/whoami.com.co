import React, { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { WhoAmINav } from "../src/components/whoami/WhoAmINav";
import { CreatorCard } from "../src/components/whoami/CreatorCard";
import { getJson } from "../src/lib/api";
import type { DiscoverView, SocialPlatform } from "../src/lib/whoami/contracts";

export default function WhoAmIDiscoverPage(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform | "">("");
  const [view, setView] = useState<DiscoverView | null>(null);

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (platform) params.set("platform", platform);
    const suffix = params.toString();
    return `/api/whoami/discover${suffix ? `?${suffix}` : ""}`;
  }, [query, platform]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void getJson<DiscoverView>(path).then(setView);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [path]);

  return (
    <div className="whoami-page whoami-dark">
      <WhoAmINav />
      <main className="whoami-discover-shell">
        <header className="whoami-discover-head">
          <div>
            <div className="whoami-kicker">DISCOVER</div>
            <h1>Find someone worth knowing.</h1>
          </div>
          <div className="whoami-search">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search creators, niches, locations..." />
          </div>
        </header>

        <div className="whoami-discover-grid">
          <aside className="whoami-filters">
            <div className="whoami-filter-title"><SlidersHorizontal size={16} /> Filters</div>
            <label>Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform | "")}>
              <option value="">All platforms</option>
              <option value="instagram">Instagram</option>
              <option value="x">X</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <label>Category</label>
            <select><option>All categories</option><option>Beauty</option><option>Technology</option><option>Lifestyle</option></select>
            <label>Location</label>
            <input placeholder="Any location" />
            <label>Budget</label>
            <div className="whoami-budget">$25 <span /> $250+</div>
            <label className="whoami-check"><input type="checkbox" defaultChecked /> Available now</label>
            <label className="whoami-check"><input type="checkbox" /> Verified only</label>
          </aside>

          <section className="whoami-results">
            <div className="whoami-results-head">
              <strong>{view?.creators.length ?? 0} creators</strong>
              <span>Sorted by relevance</span>
            </div>
            <div className="whoami-results-list">
              {(view?.creators ?? []).map((creator) => <CreatorCard creator={creator} key={creator.handle} />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
