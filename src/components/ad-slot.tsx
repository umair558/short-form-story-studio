/**
 * Reserved placement for future, unobtrusive ads (e.g. Google AdSense).
 * Renders nothing until an ad provider is configured, so no fake ads are shown
 * and no layout space is wasted.
 */
export function AdSlot(_props: { id: string }) {
  const enabled = false;
  if (!enabled) return null;
  return <aside aria-label="Advertisement" className="my-8 min-h-[100px]" />;
}
