import React from "react";
import type { Placement, RatePair } from "../../lib/whoami/contracts";

const LABELS: Record<Placement, string> = {
  post: "POST",
  story: "STORY",
  reel: "REEL",
};

export function RateTable({ rates }: { rates: Record<Placement, RatePair> }): React.ReactElement {
  return (
    <div className="whoami-rate-table">
      <div className="whoami-rate-head">
        <span />
        <span>VIDEO</span>
        <span>PHOTO</span>
      </div>
      {(Object.keys(LABELS) as Placement[]).map((placement) => (
        <div className="whoami-rate-row" key={placement}>
          <span>{LABELS[placement]}</span>
          <strong>{`$${rates[placement].video}`}</strong>
          <strong>{`$${rates[placement].photo}`}</strong>
        </div>
      ))}
    </div>
  );
}
