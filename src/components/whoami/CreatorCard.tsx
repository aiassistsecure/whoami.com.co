import React from "react";
import { Link } from "@interchained/portal-react";
import { BadgeCheck, Heart, MapPin, Users } from "lucide-react";
import type { CreatorCard as CreatorCardModel } from "../../lib/whoami/contracts";
import { SocialIcon } from "./SocialIcon";

function PlatformIcons({ handle }: { handle: string }): React.ReactElement {
  if (handle === "jordantech") {
    return <><SocialIcon name="x" /><SocialIcon name="youtube" /><SocialIcon name="instagram" /></>;
  }
  return <><SocialIcon name="instagram" /><SocialIcon name="tiktok" /><SocialIcon name="x" /></>;
}

export function CreatorCard({ creator }: { creator: CreatorCardModel }): React.ReactElement {
  return (
    <article className="wa-discover-card">
      <div className="wa-discover-photo-wrap">
        <img src={creator.avatarUrl} alt="" className="wa-discover-photo" />
        {creator.verified && <span className="wa-verified-chip"><BadgeCheck size={15} /> Verified</span>}
      </div>

      <div className="wa-discover-info">
        <strong className="wa-handle">@{creator.handle}</strong>
        <span className="wa-muted">{creator.category} · {creator.location}</span>
        <div className="wa-social-line">
          <PlatformIcons handle={creator.handle} />
          <span><MapPin size={15} /> {creator.location}</span>
        </div>
        <div className="wa-metrics">
          <span><Users size={16} /> {creator.followersLabel}</span>
          <span><Heart size={16} /> {creator.engagementLabel}</span>
        </div>
      </div>

      <div className="wa-discover-rates">
        <div className="wa-mini-head"><span></span><span>VIDEO</span><span>PHOTO</span></div>
        {(["post","story","reel"] as const).map((placement) => (
          <div className="wa-mini-rate" key={placement}>
            <span>{placement[0].toUpperCase()+placement.slice(1)}</span>
            <strong>{`$${creator.rates[placement].video}`}</strong>
            <strong>{`$${creator.rates[placement].photo}`}</strong>
          </div>
        ))}
        <div className="wa-card-actions">
          <Link href={`/creator/${encodeURIComponent(creator.handle)}`} className="wa-btn wa-btn-outline">View Profile</Link>
          <Link href="/?waitlist=brand&source=discover_offer" className="wa-btn wa-btn-black">Make Offer</Link>
        </div>
      </div>
    </article>
  );
}
