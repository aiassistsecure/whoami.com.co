import React, { useEffect, useMemo, useState } from "react";

import { getJson, postJson } from "../lib/api";

interface HireMeAccessResponse {
  inviteUrl: string | null;
  rotatedAt: string | null;
}

function editorIdentityId(): string {
  if (typeof window === "undefined") return "";
  const parts = window.location.pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts[1] ?? "");
}

export function HireMeAccessControls({
  slug,
}: {
  slug: string;
}): React.ReactElement {
  const identityId = useMemo(editorIdentityId, []);
  const [access, setAccess] = useState<HireMeAccessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const endpoint =
    identityId && slug
      ? `/api/hireme/identities/${encodeURIComponent(identityId)}/access/${encodeURIComponent(slug)}`
      : "";

  async function load(): Promise<void> {
    if (!endpoint) {
      setAccess(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      setAccess(await getJson<HireMeAccessResponse>(endpoint));
    } catch (caught) {
      setAccess(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "The private interview link could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // endpoint fully captures the identity + slug pair.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const absoluteUrl =
    access?.inviteUrl && typeof window !== "undefined"
      ? new URL(access.inviteUrl, window.location.origin).toString()
      : "";

  async function copyLink(): Promise<void> {
    if (!absoluteUrl) return;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this private interview link:", absoluteUrl);
    }
  }

  async function rotate(): Promise<void> {
    if (!endpoint) return;

    if (
      access?.inviteUrl &&
      !window.confirm(
        "Rotate the private interview link? The current link will stop working immediately.",
      )
    ) {
      return;
    }

    setRotating(true);
    setError("");
    try {
      const next = await postJson<HireMeAccessResponse>(
        `${endpoint}/rotate`,
      );
      setAccess(next);
      setCopied(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The private interview link could not be rotated.",
      );
    } finally {
      setRotating(false);
    }
  }

  if (!slug) {
    return (
      <div className="border-t border-line pt-4">
        <div className="rounded-2xl border border-line bg-surface-subtle p-4">
          <p className="text-sm font-semibold text-fg">Private interview link</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-subtle">
            Add a private booking slug first. HireMe stays hidden from the public profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-line pt-4">
      <div className="rounded-2xl border border-line bg-surface-subtle p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-fg">Private interview link</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-subtle">
              Reusable by anyone you send it to. It stays valid until you rotate it.
            </p>
          </div>
          <span aria-hidden="true" className="text-xl">🔐</span>
        </div>

        {loading ? (
          <p className="mt-4 text-xs text-fg-subtle">Loading private link…</p>
        ) : access?.inviteUrl ? (
          <>
            <input
              className="field mt-4 font-mono text-xs"
              readOnly
              value={absoluteUrl}
              aria-label="Private interview link"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary !py-2 !text-xs"
                onClick={() => void copyLink()}
              >
                {copied ? "Copied ✓" : "Copy invite link"}
              </button>
              <button
                type="button"
                className="btn btn-secondary !py-2 !text-xs"
                disabled={rotating}
                onClick={() => void rotate()}
              >
                {rotating ? "Rotating…" : "Rotate link"}
              </button>
            </div>
            {access.rotatedAt ? (
              <p className="mt-2 text-[11px] text-fg-subtle">
                Current link issued {new Date(access.rotatedAt).toLocaleString()}.
              </p>
            ) : null}
          </>
        ) : (
          <div className="mt-4">
            <button
              type="button"
              className="btn btn-primary !py-2 !text-xs"
              disabled={rotating}
              onClick={() => void rotate()}
            >
              {rotating ? "Creating…" : "Create private link"}
            </button>
          </div>
        )}

        {error ? (
          <div className="mt-3">
            <p className="text-xs leading-relaxed text-signal-red">{error}</p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-accent-soft hover:underline"
              onClick={() => void load()}
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
