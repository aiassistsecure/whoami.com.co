import React from "react";
import { Link } from "@interchained/portal-react";

export function WhoAmINav(): React.ReactElement {
  return (
    <nav className="wa-nav" aria-label="WhoAmI by The Agency">
      <div className="wa-nav-inner">
        <Link href="/" className="wa-wordmark">
          <span>whoami</span>
          <small>by The Agency</small>
          <b>BETA</b>
        </Link>
        <div className="wa-nav-links">
          <Link href="/discover">Discover</Link>
          <a href="/#about">About</a>
        </div>
        <Link href="/?waitlist=creator&source=nav" className="wa-login">Join Waitlist</Link>
      </div>
    </nav>
  );
}
