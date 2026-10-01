import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { postJson } from "../../lib/api";
import type { WaitlistJoinResponse, WaitlistRole } from "../../lib/whoami/contracts";

export function WaitlistModal({
  open,
  onClose,
  source,
  defaultRole = "creator",
}: {
  open: boolean;
  onClose: () => void;
  source: string;
  defaultRole?: WaitlistRole;
}): React.ReactElement | null {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WaitlistRole>(defaultRole);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    if (open) {
      setRole(defaultRole);
      setState("idle");
    }
  }, [open, defaultRole]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setState("sending");
    try {
      await postJson<WaitlistJoinResponse>("/api/whoami/waitlist", {
        email: clean,
        role,
        source,
      });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="wa-waitlist-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="wa-waitlist-modal" role="dialog" aria-modal="true" aria-labelledby="waitlist-title" onMouseDown={(e) => e.stopPropagation()}>
        <button className="wa-waitlist-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        {state === "done" ? (
          <div className="wa-waitlist-success">
            <span><Check size={24} /></span>
            <h2 id="waitlist-title">You&apos;re on the list.</h2>
            <p>We&apos;ll reach out when WhoAmI by The Agency opens early access.</p>
            <button className="wa-btn wa-btn-black" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="wa-waitlist-kicker">EARLY ACCESS</div>
            <h2 id="waitlist-title">Be first to know your price.</h2>
            <p>Join the WhoAmI by The Agency waitlist for launch access.</p>

            <form onSubmit={(e) => void submit(e)}>
              <div className="wa-waitlist-role" aria-label="I am joining as">
                <button type="button" className={role === "creator" ? "active" : ""} onClick={() => setRole("creator")}>Creator</button>
                <button type="button" className={role === "brand" ? "active" : ""} onClick={() => setRole("brand")}>Brand</button>
                <button type="button" className={role === "both" ? "active" : ""} onClick={() => setRole("both")}>Both</button>
              </div>

              <label className="wa-waitlist-email">
                <span>Email</span>
                <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </label>

              {state === "error" && <div className="wa-waitlist-error">Couldn&apos;t join right now. Please try again.</div>}

              <button className="wa-btn wa-btn-black wa-waitlist-submit" type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Joining…" : "Join the Waitlist"}
              </button>
            </form>

            <small>No subscriptions. No premium gates. Just launch access.</small>
          </>
        )}
      </section>
    </div>
  );
}
