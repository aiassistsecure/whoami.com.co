import React, { useEffect, useMemo, useState } from "react";
import { BadgeCheck, MapPin, X } from "lucide-react";
import { WhoAmINav } from "../../src/components/whoami/WhoAmINav";
import { RateTable } from "../../src/components/whoami/RateTable";
import { getJson, postJson } from "../../src/lib/api";
import type { CreatorProfileView, MediaType, Placement } from "../../src/lib/whoami/contracts";

function routeHandle(): string {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts[1] ?? "");
}

export default function WhoAmICreatorPage(): React.ReactElement {
  const handle = useMemo(routeHandle, []);
  const [profile, setProfile] = useState<CreatorProfileView | null>(null);
  const [offerOpen, setOfferOpen] = useState(() => new URLSearchParams(window.location.search).get("offer") === "1");
  const [placement, setPlacement] = useState<Placement>("post");
  const [mediaType, setMediaType] = useState<MediaType>("video");
  const [amount, setAmount] = useState(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void getJson<CreatorProfileView>(`/api/whoami/creators/${encodeURIComponent(handle)}`).then((next) => {
      setProfile(next);
      setAmount(next.rates.post.video);
    });
  }, [handle]);

  useEffect(() => {
    if (!profile) return;
    setAmount(profile.rates[placement][mediaType]);
  }, [profile, placement, mediaType]);

  if (!profile) {
    return <div className="whoami-page whoami-profile-page"><WhoAmINav /><div className="whoami-loading">Loading creator…</div></div>;
  }

  const listed = profile.rates[placement][mediaType];

  async function sendOffer(): Promise<void> {
    if (!profile) return;
    await postJson("/api/whoami/offers", {
      creatorHandle: profile.handle,
      platform: profile.platform,
      placement,
      mediaType,
      listedPrice: listed,
      amount,
      message: "",
    });
    setSent(true);
  }

  return (
    <div className="whoami-page whoami-profile-page">
      <WhoAmINav />
      <main className="whoami-profile-shell">
        <section className="whoami-profile-card">
          <div className="whoami-profile-hero">
            <img src={profile.avatarUrl} alt="" className="whoami-profile-avatar" />
            <div className="whoami-profile-title">
              <h1>{profile.displayName} {profile.verified && <BadgeCheck size={22} className="whoami-verified" />}</h1>
              <div className="whoami-profile-handle">@{profile.handle}</div>
              <div className="whoami-profile-tags">{profile.category} · {profile.platform.toUpperCase()}</div>
              <div className="whoami-profile-location"><MapPin size={14} /> {profile.location}</div>
            </div>
            <div className="whoami-availability">● AVAILABLE</div>
          </div>

          <p className="whoami-profile-bio">{profile.bio}</p>

          <section className="whoami-profile-rates">
            <div className="whoami-profile-section-title">MY PRICE</div>
            <RateTable rates={profile.rates} />
          </section>

          <button className="whoami-button whoami-button-primary whoami-offer-main" onClick={() => setOfferOpen(true)}>
            Make an Offer
          </button>

          <div className="whoami-profile-stats">
            <div><strong>{profile.followersLabel}</strong><span>followers</span></div>
            <div><strong>{profile.engagementLabel}</strong><span>engagement</span></div>
            <div><strong>{profile.completedDeals}</strong><span>completed deals</span></div>
            <div><strong>{profile.repeatPartners}</strong><span>repeat partners</span></div>
          </div>

          <div className="whoami-payments">
            <span>GET PAID</span>
            <strong>X Money</strong>
            <strong>Cash App</strong>
          </div>
        </section>
      </main>

      {offerOpen && (
        <div className="whoami-modal-backdrop" onMouseDown={() => setOfferOpen(false)}>
          <div className="whoami-offer-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="whoami-modal-close" onClick={() => setOfferOpen(false)}><X size={18} /></button>
            {sent ? (
              <div className="whoami-offer-sent"><div className="whoami-kicker">OFFER SENT</div><h2>It's in @{profile.handle}'s inbox.</h2></div>
            ) : (
              <>
                <div className="whoami-kicker">MAKE AN OFFER</div>
                <h2>@{profile.handle}</h2>
                <label>Placement</label>
                <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)}>
                  <option value="post">Post</option><option value="story">Story</option><option value="reel">Reel</option>
                </select>
                <label>Type</label>
                <div className="whoami-segment">
                  <button className={mediaType === "video" ? "active" : ""} onClick={() => setMediaType("video")}>Video</button>
                  <button className={mediaType === "photo" ? "active" : ""} onClick={() => setMediaType("photo")}>Photo</button>
                </div>
                <label>Your offer</label>
                <div className="whoami-money-input"><span>$</span><input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
                <div className="whoami-listed">Listed price: ${listed}</div>
                <button className="whoami-button whoami-button-primary whoami-button-lg" onClick={() => void sendOffer()}>Send Offer</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
