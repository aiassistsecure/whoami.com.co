import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Ellipsis, MapPin, Share2 } from "lucide-react";
import { RateTable } from "../../src/components/whoami/RateTable";
import { SocialIcon } from "../../src/components/whoami/SocialIcon";
import { WaitlistModal } from "../../src/components/whoami/WaitlistModal";
import { getJson } from "../../src/lib/api";
import type { CreatorProfileView, MediaType, Placement } from "../../src/lib/whoami/contracts";

function routeHandle(): string {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts[1] ?? "");
}

export default function WhoAmICreatorPage(): React.ReactElement {
  const handle = useMemo(routeHandle, []);
  const [profile, setProfile] = useState<CreatorProfileView | null>(null);
  const [placement, setPlacement] = useState<Placement>("post");
  const [mediaType, setMediaType] = useState<MediaType>("photo");
  const [amount, setAmount] = useState<number | "">("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    void getJson<CreatorProfileView>(`/api/whoami/creators/${encodeURIComponent(handle)}`).then(setProfile);
  }, [handle]);

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
            <img src={profile.avatarUrl} alt="" className="wa-profile-avatar" />

            <div className="wa-profile-actions">
              <button className="wa-btn wa-btn-outline" onClick={() => setWaitlistOpen(true)}>Follow</button>
              <a href="#offer" className="wa-btn wa-btn-black">Make an Offer</a>
            </div>

            <div className="wa-profile-name">
              <h1>@{profile.handle} {profile.verified && <BadgeCheck className="wa-blue-check" size={25} />}</h1>
              <p>{profile.category} · {profile.location}</p>
            </div>

            <p className="wa-profile-bio">{profile.bio}</p>
            <div className="wa-profile-location"><MapPin size={20} /> {profile.location}</div>

            <div className="wa-social-stats">
              <span><SocialIcon name="instagram" size={30} /><b>{profile.socialHandles?.instagram ?? profile.followersLabel}</b></span>
              <span><SocialIcon name="tiktok" size={30} /><b>{profile.socialHandles?.tiktok ?? "8.1K"}</b></span>
              <span><SocialIcon name="x" size={28} /><b>{profile.socialHandles?.x ?? "4.2K"}</b></span>
            </div>

            <nav className="wa-profile-tabs">
              <button className="active">Rates</button>
              <button>About</button>
              <button>Audience</button>
              <button>Portfolio</button>
            </nav>

            <div className="wa-profile-rates"><RateTable rates={profile.rates} /></div>

            <section className="wa-offer-card" id="offer">
              <div className="wa-offer-preview-label">MARKETPLACE PREVIEW</div>
              <h2>Make an Offer</h2>
              <div className="wa-offer-creator">
                <img src={profile.avatarUrl} alt="" />
                <div><strong>@{profile.handle}</strong><span>Instagram Post</span></div>
              </div>

              <div className="wa-offer-grid">
                <label><span>Content Type</span>
                  <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)}>
                    <option value="post">Instagram Post</option>
                    <option value="story">Instagram Story</option>
                    <option value="reel">Instagram Reel</option>
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
