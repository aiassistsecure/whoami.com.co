import React from "react";
import { Link } from "@interchained/portal-react";

export function WhoAmINav(): React.ReactElement {
  return (
    <nav className="whoami-nav">
      <div className="whoami-nav-inner">
        <Link href="/" className="whoami-wordmark"><span>whoami</span><small>by The Agency</small></Link>
        <div className="whoami-nav-links">
          <Link href="/discover">Discover</Link>
          <a href="#how-it-works">How It Works</a>
          <Link href="/identities">For Creators</Link>
          <Link href="/identities">For Brands</Link>
        </div>
        <div className="whoami-nav-actions">
          <Link href="/identities" className="whoami-login">Log in</Link>
          <Link href="/identities" className="whoami-button whoami-button-primary">Join</Link>
        </div>
      </div>
    </nav>
  );
}
