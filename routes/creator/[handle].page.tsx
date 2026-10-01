import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Ellipsis, MapPin, Share2 } from "lucide-react";
import { RateTable } from "../../src/components/whoami/RateTable";
import { SocialIcon } from "../../src/components/whoami/SocialIcon";
import { WaitlistModal } from "../../src/components/whoami/WaitlistModal";
import { getJson } from "../../src/lib/api";
import type {
  CreatorProfileView,
  MediaType,
  Placement,
  SocialPlatform,
} from "../../src/lib/whoami/contracts";

type ProfileTab = "rates" | "about" | "audience" | "portfolio";

const PROFILE_TABS: Array<{ id: ProfileTab; label: string }> = [
  { id: "rates", label: "Rates" },
  { id: "about", label: "About" },
  { id: "audience", label: "Audience" },
  { id: "portfolio", label: "Portfolio" },
];

function previewIdentity(): string {
  const query = new URLSearchParams(window.location.search).get("identity")?.trim();
  if (query) return query.toLowerCase();

  const parts = window.location.pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts[1] ?? "").toLowerCase();
}

function initialTab(): ProfileTab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return PROFILE_TABS.some((item) => item.id === tab) ? (tab as ProfileTab) : "rates";
}

function iconForPlatform(platform: SocialPlatform): "instagram" | "tiktok" | "x" | "youtube" | null {
  return platform === "instagram" || platform === "tiktok" || platform === "x" || platform === "youtube"
    ? platform
    : null;
}

function platformLabel(platform: SocialPlatform): string {
  if (platform === "x") return "X";
  return platform[0].toUpperCase() + platform.slice(1);
}

export default function WhoAmICreatorPage(): React.ReactElement {
  const identity = useMemo(previewIdentity, []);
  const [profile, setProfile] = useState<CreatorProfileView | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [placement, setPlacement] = useState<Placement>("post");
  const [mediaType, setMediaType] = useState<MediaType>("photo");
  const [amount, setAmount] = useState<number | "">("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    setLoadError(false);
    void getJson<CreatorProfileView>(
      `/api/whoami/preview?identity=${encodeURIComponent(identity)}`,
    )
      .then(setProfile)
      .catch(() => setLoadError(true));
  }, [identity]);

  function selectTab(tab: ProfileTab): void {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("identity", identity);
    if (tab === "rates") params.delete("tab");
    else params.set("tab", tab);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }

  function showOffer(): void {
    selectTab("rates");
    window.requestAnimationFrame(() => {
      document.getElementById("offer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (loadError) {
    return (
      <div className="wa-profile-loading">
        <div className="wa-profile-error">
          <strong>Preview unavailable.</strong>
          <a href="/discover">Back to creator previews</a>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="wa-profile-loading">Loading creator…</div>;

  const listed = profile.rates[placement][mediaType];
  const cover = profile.coverUrl ?? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=90";

  return (
    <div className="wa-profile-page">
      <main className="wa-profile-shell">
        <section className="wa-profile-card">
          <div className="wa-cover">
            <img src={cover} alt="" />
            <button className="wa-round wa-back" onClick={() => history.back()} aria-label="Back"><ArrowLeft /></button>
            <div className="wa-cover-actions">
              <button className="wa-cover-pill"><Share2 size={20} /> Share</button>
              <button className="wa-round" aria-label="More options"><Ellipsis /></button>
            </div>
          </div>

          <section className="wa-profile-main">
            <img src={profile.avatarUrl} alt={`${profile.displayName} profile`} className="wa-profile-avatar" />

            <div className="wa-profile-actions">
              <button className="wa-btn wa-btn-outline" onClick={() => setWaitlistOpen(true)}>Follow</button>
              <button className="wa-btn wa-btn-black" onClick={showOffer}>Make an Offer</button>
            </div>

            <div className="wa-profile-name">
              <h1>@{profile.handle} {profile.verified && <BadgeCheck className="wa-blue-check" size={25} />}</h1>
              <p>{profile.category} · {profile.location}</p>
            </div>

            <p className="wa-profile-bio">{profile.bio}</p>
            <div className="wa-profile-location"><MapPin size={20} /> {profile.location}</div>

            <div className="wa-social-stats">
              {profile.audience.slice(0, 4).map((item) => {
                const icon = iconForPlatform(item.platform);
                return (
                  <span key={item.platform}>
                    {icon ? <SocialIcon name={icon} size={item.platform === "x" ? 28 : 30} /> : <b>{platformLabel(item.platform)}</b>}
                    <b>{item.followersLabel}</b>
                  </span>
                );
              })}
            </div>

            <nav className="wa-profile-tabs" role="tablist" aria-label="Creator profile sections">
              {PROFILE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`profile-panel-${tab.id}`}
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => selectTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="wa-profile-tab-panel" id={`profile-panel-${activeTab}`} role="tabpanel">
              {activeTab === "rates" && (
                <>
                  <div className="wa-profile-rates"><RateTable rates={profile.rates} /></div>

                  <section className="wa-offer-card" id="offer">
                    <div className="wa-offer-preview-label">MARKETPLACE PREVIEW</div>
                    <h2>Make an Offer</h2>
                    <div className="wa-offer-creator">
                      <img src={profile.avatarUrl} alt="" />
                      <div><strong>@{profile.handle}</strong><span>{platformLabel(profile.platform)} Post</span></div>
                    </div>

                    <div className="wa-offer-grid">
                      <label><span>Content Type</span>
                        <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)}>
                          <option value="post">{platformLabel(profile.platform)} Post</option>
                          <option value="story">{platformLabel(profile.platform)} Story</option>
                          <option value="reel">{platformLabel(profile.platform)} Reel</option>
                        </select>
                      </label>
                      <label><span>Media Type</span>
                        <select value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType)}>
                          <option value="photo">Photo</option>
                          <option value="video">Video</option>
                        </select>
                      </label>
                      <label><span>Listed Price</span><div className="wa-readonly">${listed}</div></label>
                      <label><span>Your Offer</span>
                        <div className="wa-money"><span>$</span><input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} /></div>
                      </label>
                    </div>

                    <button className="wa-btn wa-btn-black wa-send-offer" onClick={() => setWaitlistOpen(true)}>
                      Join Waitlist to Send Offer
                    </button>
                  </section>
                </>
              )}

              {activeTab === "about" && (
                <section className="wa-profile-info-card">
                  <div className="wa-tab-heading">
                    <span>ABOUT</span>
                    <h2>{profile.displayName}</h2>
                  </div>
                  <p className="wa-about-copy">{profile.bio}</p>
                  <div className="wa-about-grid">
                    <div><span>Category</span><strong>{profile.category}</strong></div>
                    <div><span>Location</span><strong>{profile.location}</strong></div>
                    <div><span>Primary platform</span><strong>{platformLabel(profile.platform)}</strong></div>
                    <div><span>Availability</span><strong>{profile.available ? "Available for partnerships" : "Unavailable"}</strong></div>
                    <div><span>Completed deals</span><strong>{profile.completedDeals}</strong></div>
                    <div><span>Repeat partners</span><strong>{profile.repeatPartners}</strong></div>
                  </div>
                </section>
              )}

              {activeTab === "audience" && (
                <section className="wa-profile-info-card">
                  <div className="wa-tab-heading">
                    <span>AUDIENCE</span>
                    <h2>Where @{profile.handle} reaches people</h2>
                  </div>
                  <div className="wa-audience-summary">
                    <div><strong>{profile.followersLabel}</strong><span>Primary following</span></div>
                    <div><strong>{profile.engagementLabel}</strong><span>Engagement</span></div>
                    <div><strong>{profile.paymentConfirmedPercent}%</strong><span>Payment confirmed</span></div>
                  </div>
                  <div className="wa-audience-list">
                    {profile.audience.map((item) => {
                      const icon = iconForPlatform(item.platform);
                      return (
                        <div className="wa-audience-row" key={item.platform}>
                          <span className="wa-audience-platform">
                            {icon && <SocialIcon name={icon} size={26} />}
                            <b>{platformLabel(item.platform)}</b>
                          </span>
                          <strong>{item.followersLabel}</strong>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {activeTab === "portfolio" && (
                <section className="wa-profile-info-card">
                  <div className="wa-tab-heading">
                    <span>PORTFOLIO</span>
                    <h2>Recent creator work</h2>
                  </div>
                  <div className="wa-portfolio-grid">
                    {profile.portfolio.map((item, index) => (
                      <article className="wa-portfolio-card" key={`${item.title}-${index}`}>
                        <div className="wa-portfolio-image">
                          <img src={item.imageUrl} alt="" />
                          <span>{item.format}</span>
                        </div>
                        <div className="wa-portfolio-meta">
                          <strong>{item.title}</strong>
                          <span>{platformLabel(item.platform)} · {item.reachLabel}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="wa-agency-mark">WhoAmI by The Agency · Early Access</div>
          </section>
        </section>
      </main>

      <WaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        source={`profile_${profile.handle}`}
        defaultRole="brand"
      />
    </div>
  );
}
