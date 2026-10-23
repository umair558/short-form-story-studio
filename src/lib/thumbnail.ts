export const THUMB_W = 1280;
export const THUMB_H = 720;

export type FitMode = "cover" | "contain";
export type TextAlign = "left" | "center" | "right";
export type ThumbStyle = "Gaming" | "Cinematic" | "Tech" | "Vlog" | "Documentary";

export const TEXT_FONTS = [
  { id: "Manrope", label: "Manrope", stack: "Manrope, Arial, sans-serif" },
  { id: "Impact", label: "Impact", stack: "Impact, 'Arial Black', sans-serif" },
  { id: "Arial", label: "Arial", stack: "Arial, sans-serif" },
  { id: "Georgia", label: "Georgia", stack: "Georgia, serif" },
  { id: "Courier", label: "Mono", stack: "'Courier New', monospace" },
] as const;

export interface TextLayer {
  id: string;
  text: string;
  x: number; // 0–1 centre position
  y: number;
  size: number; // px at 1280×720
  color: string;
  font: string; // TEXT_FONTS id
  align: TextAlign;
  outline: boolean;
  outlineColor: string;
  shadow: boolean;
  highlight: boolean;
  highlightColor: string;
}

export interface LogoLayer {
  url: string; // object URL
  x: number; // 0–1 centre
  y: number;
  size: number; // fraction of canvas width, 0.05–0.5
}

export interface ThumbState {
  bgColor: string;
  image: string | null; // object URL of background image
  fit: FitMode;
  zoom: number; // 1–3
  offsetX: number; // -1..1
  offsetY: number;
  brightness: number; // %
  contrast: number;
  saturation: number;
  blur: number; // px 0–20
  sharpen: number; // 0–100
  overlay: number; // 0–80 % darkness
  texts: TextLayer[];
  logo: LogoLayer | null;
  badge: string;
}

export function makeText(partial: Partial<TextLayer> = {}): TextLayer {
  return {
    id: `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    text: "YOUR TEXT",
    x: 0.5,
    y: 0.82,
    size: 110,
    color: "#ffffff",
    font: "Manrope",
    align: "center",
    outline: true,
    outlineColor: "#000000",
    shadow: false,
    highlight: false,
    highlightColor: "#f97316",
    ...partial,
  };
}

export const DEFAULT_THUMB: ThumbState = {
  bgColor: "#2563eb",
  image: null,
  fit: "cover",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  sharpen: 0,
  overlay: 25,
  texts: [makeText({ id: "t0", text: "YOUR BIG IDEA", y: 0.82 })],
  logo: null,
  badge: "",
};

/** Style presets: colours, overlay and text look per creator style. */
export const STYLE_PRESETS: Record<
  ThumbStyle,
  { bgColor: string; overlay: number; text: Partial<TextLayer> }
> = {
  Gaming: {
    bgColor: "#7c3aed",
    overlay: 20,
    text: { font: "Impact", color: "#ffffff", outline: true, outlineColor: "#000000", shadow: true, highlight: false, size: 120 },
  },
  Cinematic: {
    bgColor: "#0f172a",
    overlay: 45,
    text: { font: "Georgia", color: "#f8fafc", outline: false, shadow: true, highlight: false, size: 96 },
  },
  Tech: {
    bgColor: "#0e7490",
    overlay: 25,
    text: { font: "Manrope", color: "#ffffff", outline: false, shadow: false, highlight: true, highlightColor: "#0891b2", size: 100 },
  },
  Vlog: {
    bgColor: "#f97316",
    overlay: 15,
    text: { font: "Manrope", color: "#ffffff", outline: true, outlineColor: "#000000", shadow: false, highlight: false, size: 110 },
  },
  Documentary: {
    bgColor: "#1c1917",
    overlay: 50,
    text: { font: "Georgia", color: "#fef3c7", outline: false, shadow: true, highlight: false, size: 88 },
  },
};

export function applyPreset(s: ThumbState, style: ThumbStyle): ThumbState {
  const p = STYLE_PRESETS[style];
  return {
    ...s,
    bgColor: p.bgColor,
    overlay: p.overlay,
    texts: s.texts.map((t, i) => (i === 0 ? { ...t, ...p.text } : t)),
  };
}

/** Source rect for a cover-fit image with zoom and pan (offset -1..1 maps to the movable range). */
export function coverSource(iw: number, ih: number, zoom: number, ox: number, oy: number) {
  const scale = Math.max(THUMB_W / iw, THUMB_H / ih) * zoom;
  const sw = THUMB_W / scale;
  const sh = THUMB_H / scale;
  const sx = ((iw - sw) / 2) * (1 + ox);
  const sy = ((ih - sh) / 2) * (1 + oy);
  return { sx, sy, sw, sh };
}

/** Greedy word wrap using the canvas' measureText. */
export function wrapLines(measure: (s: string) => number, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const t = line ? `${line} ${word}` : word;
      if (measure(t) > maxW && line) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out.filter((l, i, a) => l || (i > 0 && i < a.length - 1));
}

function fontStack(id: string): string {
  return TEXT_FONTS.find((f) => f.id === id)?.stack ?? TEXT_FONTS[0].stack;
}

// --- Sharpen (unsharp-style 3×3 convolution), cached per image+params ---
const sharpenCache = new Map<string, HTMLCanvasElement>();

function sharpened(
  img: HTMLImageElement,
  sx: number, sy: number, sw: number, sh: number,
  amount: number,
): HTMLCanvasElement | null {
  const key = `${img.src.slice(0, 64)}|${sx.toFixed(1)},${sy.toFixed(1)},${sw.toFixed(1)},${sh.toFixed(1)}|${amount}`;
  const hit = sharpenCache.get(key);
  if (hit) return hit;
  if (sharpenCache.size > 6) sharpenCache.clear();
  const c = document.createElement("canvas");
  c.width = THUMB_W;
  c.height = THUMB_H;
  const cctx = c.getContext("2d", { willReadFrequently: true });
  if (!cctx) return null;
  cctx.drawImage(img, sx, sy, sw, sh, 0, 0, THUMB_W, THUMB_H);
  const data = cctx.getImageData(0, 0, THUMB_W, THUMB_H);
  const src = new Uint8ClampedArray(data.data);
  const d = data.data;
  const k = amount / 100; // 0–1
  const w = THUMB_W, h = THUMB_H;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const centre = src[i + ch] * (1 + 4 * k);
        const neighbours =
          (src[i - 4 + ch] + src[i + 4 + ch] + src[i - w * 4 + ch] + src[i + w * 4 + ch]) * k;
        d[i + ch] = centre - neighbours;
      }
    }
  }
  cctx.putImageData(data, 0, 0);
  sharpenCache.set(key, c);
  return c;
}

export interface ThumbImages {
  bg: HTMLImageElement | null;
  logo: HTMLImageElement | null;
}

export function drawThumbnail(ctx: CanvasRenderingContext2D, s: ThumbState, images: ThumbImages) {
  ctx.save();
  ctx.clearRect(0, 0, THUMB_W, THUMB_H);
  ctx.fillStyle = s.bgColor;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);

  const img = images.bg;
  if (img) {
    const scale =
      s.fit === "cover"
        ? Math.max(THUMB_W / img.naturalWidth, THUMB_H / img.naturalHeight)
        : Math.min(THUMB_W / img.naturalWidth, THUMB_H / img.naturalHeight);
    const zscale = scale * s.zoom;
    const sw = THUMB_W / zscale;
    const sh = THUMB_H / zscale;
    const sx = Math.min(Math.max(((img.naturalWidth - sw) / 2) * (1 + s.offsetX), 0), Math.max(img.naturalWidth - sw, 0));
    const sy = Math.min(Math.max(((img.naturalHeight - sh) / 2) * (1 + s.offsetY), 0), Math.max(img.naturalHeight - sh, 0));
    const filters = [
      `brightness(${s.brightness}%)`,
      `contrast(${s.contrast}%)`,
      `saturate(${s.saturation}%)`,
      s.blur > 0 ? `blur(${s.blur}px)` : "",
    ].filter(Boolean).join(" ");
    ctx.filter = filters || "none";
    if (s.sharpen > 0 && s.blur === 0) {
      const sharp = sharpened(img, sx, sy, sw, sh, s.sharpen);
      if (sharp) ctx.drawImage(sharp, 0, 0);
      else ctx.drawImage(img, sx, sy, sw, sh, 0, 0, THUMB_W, THUMB_H);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, THUMB_W, THUMB_H);
    }
    ctx.filter = "none";
  }

  if (s.overlay > 0) {
    ctx.fillStyle = `rgba(0,0,0,${s.overlay / 100})`;
    ctx.fillRect(0, 0, THUMB_W, THUMB_H);
  }

  for (const t of s.texts) {
    if (!t.text.trim()) continue;
    ctx.font = `800 ${t.size}px ${fontStack(t.font)}`;
    ctx.textBaseline = "middle";
    const maxW = THUMB_W - 96;
    const lines = wrapLines((x) => ctx.measureText(x).width, t.text, maxW);
    const lh = t.size * 1.12;
    const total = lines.length * lh;
    let y = t.y * THUMB_H - total / 2 + lh / 2;
    if (t.shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = t.size / 6;
      ctx.shadowOffsetY = t.size / 14;
    }
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      const cx = t.x * THUMB_W;
      const x = t.align === "left" ? cx : t.align === "center" ? cx - w / 2 : cx - w;
      if (t.highlight) {
        ctx.save();
        ctx.shadowColor = "transparent";
        ctx.fillStyle = t.highlightColor;
        ctx.fillRect(x - 18, y - lh / 2, w + 36, lh);
        ctx.restore();
      }
      if (t.outline) {
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(6, t.size / 8);
        ctx.strokeStyle = t.outlineColor;
        ctx.strokeText(line, x, y);
      }
      ctx.fillStyle = t.color;
      ctx.fillText(line, x, y);
      y += lh;
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const logo = images.logo;
  if (s.logo && logo) {
    const w = s.logo.size * THUMB_W;
    const h = (w / logo.naturalWidth) * logo.naturalHeight;
    ctx.drawImage(logo, s.logo.x * THUMB_W - w / 2, s.logo.y * THUMB_H - h / 2, w, h);
  }

  if (s.badge.trim()) {
    ctx.font = "800 44px Manrope, Arial, sans-serif";
    ctx.textBaseline = "middle";
    const t = s.badge.trim().toUpperCase();
    const w = ctx.measureText(t).width + 48;
    const bx = THUMB_W - 64 - w;
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.roundRect(bx, 48, w, 72, 14);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(t, bx + 24, 84);
  }
  ctx.restore();
}
