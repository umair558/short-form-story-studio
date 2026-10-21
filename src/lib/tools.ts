import {
  Captions,
  Zap,
  Hash,
  Lightbulb,
  UserRound,
  Type,
  Crop,
  FileDown,
  Workflow,
  MonitorPlay,
  CalendarDays,
  ImagePlus,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "AI Writing" | "Image" | "Workflow";
export type ToolTone = "blue" | "orange" | "violet" | "teal" | "green" | "blueViolet";
export type ToolFilter = "All" | ToolCategory | "Social Media";

export interface ToolInfo {
  slug: string;
  path:
    | "/tools/creator-workflow"
    | "/tools/caption-generator"
    | "/tools/hook-generator"
    | "/tools/hashtag-assistant"
    | "/tools/content-ideas"
    | "/tools/bio-generator"
    | "/tools/thumbnail-text"
    | "/tools/image-resizer"
    | "/tools/image-compressor"
    | "/tools/youtube-title-description"
    | "/tools/content-calendar"
    | "/tools/youtube-thumbnail-maker";
  name: string;
  short: string;
  category: ToolCategory;
  icon: LucideIcon;
  popular?: boolean;
  tone: ToolTone;
  /** Used directly for social posts (the "Social Media" filter). */
  social?: boolean;
  keywords: string;
}

export const TOOLS: ToolInfo[] = [
  {
    slug: "creator-workflow",
    tone: "blueViolet",
    social: true,
    path: "/tools/creator-workflow",
    name: "Creator Workflow",
    short: "One topic in, a full post package out: hook, caption, hashtags and thumbnail text.",
    category: "Workflow",
    icon: Workflow,
    popular: true,
    keywords: "package all in one post plan",
  },
  {
    slug: "caption-generator",
    tone: "blue",
    social: true,
    path: "/tools/caption-generator",
    name: "AI Caption Generator",
    short: "Write platform-ready captions in the tone that fits your channel.",
    category: "AI Writing",
    icon: Captions,
    popular: true,
    keywords: "caption text description copy",
  },
  {
    slug: "hook-generator",
    tone: "orange",
    social: true,
    path: "/tools/hook-generator",
    name: "Viral Hook Generator",
    short: "Get several scroll-stopping opening lines for your next short video.",
    category: "AI Writing",
    icon: Zap,
    popular: true,
    keywords: "hook opening intro first line",
  },
  {
    slug: "hashtag-assistant",
    tone: "violet",
    social: true,
    path: "/tools/hashtag-assistant",
    name: "Hashtag Assistant",
    short: "Relevant hashtag suggestions grouped from broad to niche.",
    category: "AI Writing",
    icon: Hash,
    keywords: "hashtags tags discover",
  },
  {
    slug: "content-ideas",
    tone: "teal",
    path: "/tools/content-ideas",
    name: "Content Idea Generator",
    short: "Fresh video ideas tailored to your niche and platform.",
    category: "AI Writing",
    icon: Lightbulb,
    keywords: "ideas brainstorm topics",
  },
  {
    slug: "bio-generator",
    tone: "blueViolet",
    social: true,
    path: "/tools/bio-generator",
    name: "Bio Generator",
    short: "Short, clear profile bios that say what you do and why to follow.",
    category: "AI Writing",
    icon: UserRound,
    keywords: "bio profile about",
  },
  {
    slug: "thumbnail-text",
    tone: "orange",
    social: true,
    path: "/tools/thumbnail-text",
    name: "Thumbnail Text Generator",
    short: "Punchy 2–5 word overlays for covers and thumbnails.",
    category: "AI Writing",
    icon: Type,
    keywords: "thumbnail cover title overlay",
  },
  {
    slug: "image-resizer",
    tone: "teal",
    social: true,
    path: "/tools/image-resizer",
    name: "Social Media Image Resizer",
    short: "Resize images to exact platform sizes, right in your browser.",
    category: "Image",
    icon: Crop,
    popular: true,
    keywords: "resize crop dimensions story post thumbnail",
  },
  {
    slug: "image-compressor",
    tone: "green",
    path: "/tools/image-compressor",
    name: "Image Compressor",
    short: "Shrink file size with a quality slider. Nothing leaves your device.",
    category: "Image",
    icon: FileDown,
    keywords: "compress reduce size optimize",
  },
  {
    slug: "youtube-title-description",
    tone: "orange",
    social: true,
    path: "/tools/youtube-title-description",
    name: "YouTube Title & Description Generator",
    short: "Search-friendly title options, a full description and tags for your next upload.",
    category: "AI Writing",
    icon: MonitorPlay,
    popular: true,
    keywords: "youtube title description tags seo metadata upload",
  },
  {
    slug: "content-calendar",
    tone: "blue",
    social: true,
    path: "/tools/content-calendar",
    name: "Social Media Content Calendar",
    short: "A 7, 14 or 30-day posting plan with daily ideas and hooks. Export to CSV.",
    category: "Workflow",
    icon: CalendarDays,
    keywords: "calendar schedule plan posting 7 14 30 days month week",
  },
  {
    slug: "youtube-thumbnail-maker",
    tone: "violet",
    social: true,
    path: "/tools/youtube-thumbnail-maker",
    name: "YouTube Thumbnail Maker",
    short: "Design a 1280×720 thumbnail with your photo, bold text and filters, then download.",
    category: "Image",
    icon: ImagePlus,
    popular: true,
    keywords: "thumbnail youtube cover design editor text image",
  },
];

export const CATEGORIES: ToolFilter[] = ["All", "Workflow", "AI Writing", "Social Media", "Image"];

export function filterTools(query: string, category: ToolFilter) {
  const q = query.trim().toLowerCase();
  return TOOLS.filter(
    (t) =>
      (category === "All" || (category === "Social Media" ? !!t.social : t.category === category)) &&
      (!q || `${t.name} ${t.short} ${t.keywords}`.toLowerCase().includes(q)),
  );
}

export const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "X"] as const;
export const CONTENT_TYPES = ["Short video", "Tutorial", "Story / vlog", "Product review", "Text post"] as const;
