import React from "react";
import { Link } from "@interchained/portal-react";

export default function WhoAmIPrivacyPage(): React.ReactElement {
  return (
    <div className="wa-privacy-page">
      <header className="wa-privacy-nav">
        <Link href="/" className="wa-privacy-wordmark">whoami <small>by The Agency</small></Link>
        <Link href="/" className="wa-btn wa-btn-black">Back home</Link>
      </header>

      <main className="wa-privacy-shell">
        <div className="wa-privacy-kicker">PRIVACY</div>
        <h1>Waitlist privacy.</h1>
        <p className="wa-privacy-lead">
          WhoAmI by The Agency is currently in early access. The waitlist collects only
          the information needed to operate that launch funnel.
        </p>

        <section>
          <h2>What we collect</h2>
          <p>
            When you join the waitlist, we store your email address, whether you identify
            as a creator, a brand, or both, the part of WhoAmI you joined from, and basic
            timestamps used to operate the waitlist.
          </p>
        </section>

        <section>
          <h2>Why we collect it</h2>
          <p>
            We use this information to manage early access, understand whether interest is
            coming from creators or brands, and send launch or access communications related
            to WhoAmI.
          </p>
        </section>

        <section>
          <h2>What we do not do</h2>
          <p>
            We do not sell waitlist information to advertisers. Joining the waitlist does
            not create a paid subscription and does not enroll you in a premium tier.
          </p>
        </section>

        <section>
          <h2>Storage</h2>
          <p>
            Waitlist records are stored in the WhoAmI application database and are kept only
            for operating the waitlist, early access, and launch communications.
          </p>
        </section>

        <p className="wa-privacy-updated">Effective October 1, 2026.</p>
      </main>
    </div>
  );
}
