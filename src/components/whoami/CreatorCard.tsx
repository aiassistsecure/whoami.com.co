import React from "react";
import { Link } from "@interchained/portal-react";
import { BadgeCheck, MapPin } from "lucide-react";
import type { CreatorCard as CreatorCardModel } from "../../lib/whoami/contracts";
import { RateTable } from "./RateTable";

export function CreatorCard({ creator, compact = false }: { creator: CreatorCardModel; compact?: boolean }): React.ReactElement {
  return (
    <article className={compact ? "whoami-creator-card compact" : "whoami-creator-card"}>
      <div className="whoami-creator-top">
        <img src={creator.avatarUrl} alt="" className="whoami-avatar" />
        <div className="whoami-creator-id">
          <div className="whoami-creator-name">
            @{creator.handle}
            {creator.verified && <BadgeCheck size={16} className="whoami-verified" aria-label="verified" />}
          </div>
          <div className="whoami-creator-meta">{creator.category}</div>
          <div className="whoami-creator-meta"><MapPin size={12} /> {creator.location}</div>
        </div>
        <div className="whoami-stat">
          <strong>{creator.followersLabel}</strong>
          <span>followers</span>
        </div>
      </div>
      <RateTable rates={creator.rates} />
      <div className="whoami-payment-row">
        <span>{creator.paymentMethods.includes("x_money") ? "X Money" : ""}</span>
        <span>{creator.paymentMethods.includes("cash_app") ? "Cash App" : ""}</span>
      </div>
      <div className="whoami-card-actions">
        <Link href={`/creator/${encodeURIComponent(creator.handle)}`} className="whoami-button whoami-button-secondary">View profile</Link>
        <Link href={`/creator/${encodeURIComponent(creator.handle)}?offer=1`} className="whoami-button whoami-button-primary">Make offer</Link>
      </div>
    </article>
  );
}
