import React, { useEffect, useState } from "react";
import { Link } from "@interchained/portal-react";
import { ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { WhoAmINav } from "../src/components/whoami/WhoAmINav";
import { getJson } from "../src/lib/api";
import type { HomeView } from "../src/lib/whoami/contracts";

export const intent = {
  purpose: "WhoAmI by The Agency creator marketplace landing page",
  primaryAction: "List yourself",
  seoKeyword: "creator marketplace",
};

const HERO = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=92";

export default function WhoAmIHomePage(): React.ReactElement {
  const [view, setView] = useState<HomeView | null>(null);

  useEffect(() => {
    void getJson<HomeView>("/api/whoami/home").then(setView);
  }, []);

  return (
    <div className="wa-page wa-dark">
      <WhoAmINav />
      <main>
        <section className="wa-landing-hero">
          <img src={HERO} alt="" className="wa-hero-photo" fetchPriority="high" />
          <div className="wa-hero-shade" />
          <div className="wa-hero-copy">
            <h1>Everyone&apos;s<br />social media<br />has value.</h1>
            <div className="wa-price-line">What&apos;s your price?</div>
            <p>A simple marketplace to connect creators and brands for real opportunities.</p>
            <div className="wa-hero-actions">
              <Link href="/identities" className="wa-btn wa-btn-light wa-btn-hero">List Yourself <ArrowRight size={20} /></Link>
              <Link href="/discover" className="wa-btn wa-btn-ghost wa-btn-hero">Find Creators</Link>
            </div>
            <div className="wa-trust-row">
              <span><CheckCircle2 size={18} /> No subscriptions</span>
              <span><ShieldCheck size={18} /> Everyone is premium</span>
              <span><CheckCircle2 size={18} /> Open source</span>
            </div>
          </div>
        </section>

        <section className="wa-featured" id="about">
          <div className="wa-section-title">
            <h2>Featured Creators</h2>
            <Link href="/discover">View all <ArrowRight size={20} /></Link>
          </div>
          <div className="wa-featured-grid">
            {(view?.featuredCreators ?? []).slice(0, 3).map((creator) => (
              <article className="wa-feature-card" key={creator.handle}>
                <div className="wa-feature-image-wrap">
                  <img src={creator.avatarUrl} alt={`${creator.displayName} creator portrait`} className="wa-feature-image" loading="lazy" />
                  {creator.verified && <span className="wa-verified-chip"><BadgeCheck size={15} /> Verified</span>}
                </div>
                <strong>@{creator.handle}</strong>
                <span>{creator.category} · {creator.location.replace(", FL", "")}</span>
                <div className="wa-feature-rates">
                  <div><span>Post</span><b>${creator.rates.post.video} / ${creator.rates.post.photo}</b></div>
                  <div><span>Story</span><b>${creator.rates.story.video} / ${creator.rates.story.photo}</b></div>
                  <div><span>Reel</span><b>${creator.rates.reel.video} / ${creator.rates.reel.photo}</b></div>
                </div>
                <Link href={"/creator/" + encodeURIComponent(creator.handle)} className="wa-btn wa-btn-light wa-feature-button">View Profile</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="wa-footer">WhoAmI by The Agency · GPLv3</footer>
    </div>
  );
}
