import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@interchained/portal-react";
import { ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { WaitlistModal } from "../src/components/whoami/WaitlistModal";
import { WhoAmINav } from "../src/components/whoami/WhoAmINav";
import { getJson } from "../src/lib/api";
import type { HomeView, WaitlistRole } from "../src/lib/whoami/contracts";

export const intent = {
  purpose: "WhoAmI by The Agency early-access waitlist",
  primaryAction: "Join the waitlist",
  seoKeyword: "creator marketplace waitlist",
};

const HERO = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=92";

export default function WhoAmIHomePage(): React.ReactElement {
  const [view, setView] = useState<HomeView | null>(null);
  const initialWaitlist = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const rawRole = params.get("waitlist");
    const role: WaitlistRole = rawRole === "brand" || rawRole === "both" ? rawRole : "creator";
    return {
      open: params.has("waitlist"),
      role,
      source: params.get("source") || "landing",
    };
  }, []);
  const [waitlistOpen, setWaitlistOpen] = useState(initialWaitlist.open);
  const [waitlistRole, setWaitlistRole] = useState<WaitlistRole>(initialWaitlist.role);
  const [waitlistSource, setWaitlistSource] = useState(initialWaitlist.source);

  useEffect(() => {
    void getJson<HomeView>("/api/whoami/home").then(setView);
  }, []);

  function openWaitlist(role: WaitlistRole, source: string): void {
    setWaitlistRole(role);
    setWaitlistSource(source);
    setWaitlistOpen(true);
  }

  function closeWaitlist(): void {
    setWaitlistOpen(false);
    if (window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

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
              <button className="wa-btn wa-btn-light wa-btn-hero" onClick={() => openWaitlist("creator", "hero_creator")}>
                Join the Waitlist <ArrowRight size={20} />
              </button>
              <Link href="/discover" className="wa-btn wa-btn-ghost wa-btn-hero">Preview Creators</Link>
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
            <Link href="/discover">Preview all <ArrowRight size={20} /></Link>
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
                <Link href={"/creator/preview?identity=" + encodeURIComponent(creator.handle)} className="wa-btn wa-btn-light wa-feature-button">Preview Profile</Link>
              </article>
            ))}
          </div>

          <div className="wa-waitlist-band">
            <div>
              <span>EARLY ACCESS</span>
              <h3>Creators set the price. Brands make the offer.</h3>
              <p>Join now and we&apos;ll invite you when the marketplace opens.</p>
            </div>
            <div className="wa-waitlist-band-actions">
              <button className="wa-btn wa-btn-light" onClick={() => openWaitlist("creator", "landing_band_creator")}>I&apos;m a Creator</button>
              <button className="wa-btn wa-btn-ghost" onClick={() => openWaitlist("brand", "landing_band_brand")}>I&apos;m a Brand</button>
            </div>
          </div>
        </section>
      </main>
      <footer className="wa-footer">WhoAmI by The Agency · GPLv3 · <Link href="/privacy">Privacy</Link></footer>

      <WaitlistModal
        open={waitlistOpen}
        onClose={closeWaitlist}
        source={waitlistSource}
        defaultRole={waitlistRole}
      />
    </div>
  );
}
