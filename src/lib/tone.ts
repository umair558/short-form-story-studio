import type { ToolTone } from "./tools";

/** Literal class strings per tool colour identity (kept literal so Tailwind keeps them). */
export const TONE: Record<ToolTone, { icon: string; text: string; badge: string; hover: string }> = {
  blue: { icon: "bg-primary-soft text-primary", text: "text-primary", badge: "bg-primary-soft text-accent-foreground", hover: "hover:border-primary/40" },
  orange: { icon: "bg-orange-soft text-orange-ink", text: "text-orange-ink", badge: "bg-orange-soft text-orange-ink", hover: "hover:border-orange/40" },
  violet: { icon: "bg-violet-soft text-violet", text: "text-violet", badge: "bg-violet-soft text-violet", hover: "hover:border-violet/40" },
  teal: { icon: "bg-teal-soft text-teal", text: "text-teal", badge: "bg-teal-soft text-teal", hover: "hover:border-teal/40" },
  green: { icon: "bg-green-soft text-green", text: "text-green", badge: "bg-green-soft text-green", hover: "hover:border-green/40" },
  blueViolet: { icon: "bg-gradient-to-br from-primary-soft to-violet-soft text-violet", text: "text-primary", badge: "bg-violet-soft text-violet", hover: "hover:border-violet/40" },
};
