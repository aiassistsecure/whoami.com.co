import React from "react";

export type SocialIconName = "instagram" | "tiktok" | "x" | "youtube";

export function SocialIcon({
  name,
  size = 20,
  className = "",
}: {
  name: SocialIconName;
  size?: number;
  className?: string;
}): React.ReactElement {
  return (
    <span
      className={`whoami-social-icon whoami-social-${name} ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img src={`/whoami/icons/${name}.svg`} alt="" />
    </span>
  );
}
