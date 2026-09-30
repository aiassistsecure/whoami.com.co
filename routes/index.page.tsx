import React, { useEffect, useState } from "react";
import { Link } from "@interchained/portal-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { WhoAmINav } from "../src/components/whoami/WhoAmINav";
import { CreatorCard } from "../src/components/whoami/CreatorCard";
import { getJson } from "../src/lib/api";
import type { HomeView } from "../src/lib/whoami/contracts";

export const intent = {
  purpose: "WhoAmI creator marketplace landing page",
  primaryAction: "List yourself",
  seoKeyword: "creator marketplace",
};

export default function WhoAmIHomePage(): React.ReactElement {
  const [view, setView] = useState<HomeView | null>(null);

  useEffect(() => {
    void getJson<HomeView>("/api/whoami/home").then(setView);
  }, []);

  return (
    <div className="whoami-page whoami-dark">
      <WhoAmINav />
      <main>
        <section className="whoami-hero">
          <div className="whoami-hero-copy">
            <div className="whoami-kicker">EVERYONE IS AN INFLUENCER</div>
            <h1>Everyone's social media has value.</h1>
            <p className="whoami-hero-price">What's your price?</p>
            <p className="whoami-hero-sub">
              Set your rates. Get discovered. Make direct deals with brands.
              No premium gates. No agency required.
            </p>
            <div className="whoami-hero-actions">
              <Link href="/identities" className="whoami-button whoami-button-primary whoami-button-lg">
                List Yourself <ArrowRight size={18} />
              </Link>
              <Link href="/discover" className="whoami-button whoami-button-secondary whoami-button-lg">
                Find Creators
              </Link>
            </div>
            <div className="whoami-trust-line">
              <span><CheckCircle2 size={15} /> Open source</span>
              <span><CheckCircle2 size={15} /> Everyone gets the tools</span>
              <span><CheckCircle2 size={15} /> You set the price</span>
            </div>
          </div>

          <div className="whoami-hero-preview">
            <div className="whoami-preview-glow" />
            <div className="whoami-preview-stack">
              {(view?.featuredCreators ?? []).slice(0, 2).map((creator) => (
                <CreatorCard creator={creator} compact key={creator.handle} />
              ))}
            </div>
          </div>
        </section>

        <section className="whoami-section" id="how-it-works">
          <div className="whoami-section-heading">
            <span>HOW IT WORKS</span>
            <h2>Simple by design.</h2>
          </div>
          <div className="whoami-three-up">
            <div><strong>01</strong><h3>List yourself</h3><p>Add your socials and set video/photo rates for posts, stories, and reels.</p></div>
            <div><strong>02</strong><h3>Get discovered</h3><p>Brands search by platform, category, location, and price.</p></div>
            <div><strong>03</strong><h3>Make the deal</h3><p>Accept or counter an offer, then get paid through X Money or Cash App.</p></div>
          </div>
        </section>
      </main>
    </div>
  );
}
