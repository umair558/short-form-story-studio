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
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "AI Writing" | "Image" | "Workflow";

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
    | "/tools/image-compressor";
  name: string;
  short: string;
  category: ToolCategory;
  icon: LucideIcon;
  popular?: boolean;
  keywords: string;
}

export const TOOLS: ToolInfo[] = [
  {
    slug: "creator-workflow",
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
    path: "/tools/hashtag-assistant",
    name: "Hashtag Assistant",
    short: "Relevant hashtag suggestions grouped from broad to niche.",
    category: "AI Writing",
    icon: Hash,
    keywords: "hashtags tags discover",
  },
  {
    slug: "content-ideas",
    path: "/tools/content-ideas",
    name: "Content Idea Generator",
    short: "Fresh video ideas tailored to your niche and platform.",
    category: "AI Writing",
    icon: Lightbulb,
    keywords: "ideas brainstorm topics",
  },
  {
    slug: "bio-generator",
    path: "/tools/bio-generator",
    name: "Bio Generator",
    short: "Short, clear profile bios that say what you do and why to follow.",
    category: "AI Writing",
    icon: UserRound,
    keywords: "bio profile about",
  },
  {
    slug: "thumbnail-text",
    path: "/tools/thumbnail-text",
    name: "Thumbnail Text Generator",
    short: "Punchy 2–5 word overlays for covers and thumbnails.",
    category: "AI Writing",
    icon: Type,
    keywords: "thumbnail cover title overlay",
  },
  {
    slug: "image-resizer",
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
    path: "/tools/image-compressor",
    name: "Image Compressor",
    short: "Shrink file size with a quality slider. Nothing leaves your device.",
    category: "Image",
    icon: FileDown,
    keywords: "compress reduce size optimize",
  },
];

export const CATEGORIES: ("All" | ToolCategory)[] = ["All", "Workflow", "AI Writing", "Image"];

export function filterTools(query: string, category: "All" | ToolCategory) {
  const q = query.trim().toLowerCase();
  return TOOLS.filter(
    (t) =>
      (category === "All" || t.category === category) &&
      (!q || `${t.name} ${t.short} ${t.keywords}`.toLowerCase().includes(q)),
  );
}

export const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts"] as const;
