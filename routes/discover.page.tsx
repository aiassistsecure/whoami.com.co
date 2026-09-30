import React, { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
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
    const timer = window.setTimeout(() => void getJson<DiscoverView>(path).then(setView), 100);
    return () => window.clearTimeout(timer);
  }, [path]);

  return (
    <div className="wa-page wa-dark wa-discover-page">
      <header className="wa-discover-top">
        <a href="/" className="wa-discover-wordmark">whoami<small>by The Agency</small></a>
        <div className="wa-discover-icons">
          <Search size={25} />
          <Bell size={23} />
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80" alt="" />
        </div>
      </header>

      <main className="wa-discover-shell">
        <h1>Find Creators</h1>
        <p className="wa-discover-sub">Search by platform, content type, location, or category.</p>

        <div className="wa-searchbox">
          <Search size={23} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search creators, niches, or locations..." />
          <SlidersHorizontal size={22} />
        </div>

        <div className="wa-filter-pills">
          <button onClick={() => setPlatform(platform ? "" : "instagram")}>Platform <ChevronDown size={16} /></button>
          <button>Content Type <ChevronDown size={16} /></button>
          <button>Location <ChevronDown size={16} /></button>
          <button>Category <ChevronDown size={16} /></button>
        </div>

        <div className="wa-range-row">
          <span>$0</span>
          <div className="wa-range"><i /><b className="wa-range-dot first" /><b className="wa-range-dot last" /></div>
          <span>$500+</span>
          <label><input type="checkbox" /> Verified only</label>
        </div>

        <div className="wa-results-toolbar">
          <span>342 creators</span>
          <button>Most relevant <ChevronDown size={16} /></button>
        </div>

        <section className="wa-results-list">
          {(view?.creators ?? []).map((creator) => <CreatorCard creator={creator} key={creator.handle} />)}
        </section>
      </main>
      <footer className="wa-footer">WhoAmI by The Agency</footer>
    </div>
  );
}
