import React from "react";
import type { Placement, RatePair } from "../../lib/whoami/contracts";
import { SocialIcon } from "./SocialIcon";

const LABELS: Record<Placement, string> = { post: "Post", story: "Story", reel: "Reel" };

export function RateTable({ rates }: { rates: Record<Placement, RatePair> }): React.ReactElement {
  return (
    <div className="wa-profile-rate-table">
      <div className="wa-profile-rate-head">
        <span>Content Type</span><span>Video</span><span>Photo</span>
      </div>
      {(Object.keys(LABELS) as Placement[]).map((placement) => (
        <div className="wa-profile-rate-row" key={placement}>
          <span className="wa-profile-rate-label"><SocialIcon name="instagram" size={24} /> {LABELS[placement]}</span>
          <strong>{`$${rates[placement].video}`}</strong>
          <strong>{`$${rates[placement].photo}`}</strong>
        </div>
      ))}
    </div>
  );
}
