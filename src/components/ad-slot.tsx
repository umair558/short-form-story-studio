import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAccount } from "./auth-provider";

/** Adsterra codes — exact, unmodified. */
const SOCIAL_BAR_SRC = "https://bicea.org/14/61af6c0c6b45808e03b890a051cc8440";
const NATIVE_SRC = "https://bicea.org/21/e2e939311719414d01527cd797a90897";
const NATIVE_CONTAINER = "container-e2e939311719414d01527cd797a90897";
const NO_AD_PATHS = ["/auth", "/reset-password"];

function useAdsAllowed() {
  const { user, ready } = useAccount();
  const { pathname } = useLocation();
  return ready && !!user && !NO_AD_PATHS.some((p) => pathname.startsWith(p));
}

/** Global Social Bar, loaded once for signed-in users. */
export function SocialBarAd() {
  const allowed = useAdsAllowed();
  useEffect(() => {
    if (!allowed || document.querySelector(`script[src="${SOCIAL_BAR_SRC}"]`)) return;
    const s = document.createElement("script");
    s.setAttribute("data-cfasync", "false");
    s.src = SOCIAL_BAR_SRC;
    document.body.appendChild(s);
  }, [allowed]);
  return null;
}

/** Native Banner — rendered only in the single dashboard slot to avoid duplicates. */
export function AdSlot({ id }: { id: string }) {
  const allowed = useAdsAllowed();
  const ref = useRef<HTMLDivElement>(null);
  const enabled = allowed && id === "home-mid";
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("fetchpriority", "high");
    s.setAttribute("data-cfasync", "false");
    s.src = NATIVE_SRC;
    ref.current.prepend(s);
    return () => s.remove();
  }, [enabled]);
  if (!enabled) return null;
  return (
    <aside aria-label="Advertisement" className="my-10 w-full overflow-hidden" ref={ref}>
      <div id={NATIVE_CONTAINER} />
    </aside>
  );
}
