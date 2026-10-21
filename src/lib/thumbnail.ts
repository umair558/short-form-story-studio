export const THUMB_W = 1280;
export const THUMB_H = 720;

export interface ThumbState {
  bgColor: string;
  zoom: number; // 1–3
  offsetX: number; // -1..1
  offsetY: number;
  brightness: number; // %
  contrast: number;
  saturation: number;
  overlay: number; // 0–80 % darkness
  headline: string;
  fontSize: number;
  textColor: string;
  stroke: boolean;
  highlight: boolean;
  highlightColor: string;
  align: "left" | "center" | "right";
  vAlign: "top" | "middle" | "bottom";
  badge: string;
}

export const DEFAULT_THUMB: ThumbState = {
  bgColor: "#2563eb",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  overlay: 25,
  headline: "YOUR BIG IDEA",
  fontSize: 120,
  textColor: "#ffffff",
  stroke: true,
  highlight: false,
  highlightColor: "#f97316",
  align: "left",
  vAlign: "bottom",
  badge: "",
};

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

export function drawThumbnail(ctx: CanvasRenderingContext2D, s: ThumbState, img: HTMLImageElement | null) {
  ctx.save();
  ctx.clearRect(0, 0, THUMB_W, THUMB_H);
  ctx.fillStyle = s.bgColor;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);
  if (img) {
    const r = coverSource(img.naturalWidth, img.naturalHeight, s.zoom, s.offsetX, s.offsetY);
    ctx.filter = `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%)`;
    ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, THUMB_W, THUMB_H);
    ctx.filter = "none";
  }
  if (s.overlay > 0) {
    ctx.fillStyle = `rgba(0,0,0,${s.overlay / 100})`;
    ctx.fillRect(0, 0, THUMB_W, THUMB_H);
  }
  const pad = 64;
  if (s.headline.trim()) {
    ctx.font = `800 ${s.fontSize}px Manrope, Arial, sans-serif`;
    ctx.textBaseline = "top";
    const lines = wrapLines((t) => ctx.measureText(t).width, s.headline, THUMB_W - pad * 2);
    const lh = s.fontSize * 1.1;
    const total = lines.length * lh;
    let y = s.vAlign === "top" ? pad + (s.badge ? 80 : 0) : s.vAlign === "middle" ? (THUMB_H - total) / 2 : THUMB_H - pad - total;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      const x = s.align === "left" ? pad : s.align === "center" ? (THUMB_W - w) / 2 : THUMB_W - pad - w;
      if (s.highlight) {
        ctx.fillStyle = s.highlightColor;
        ctx.fillRect(x - 18, y - 8, w + 36, lh);
      }
      if (s.stroke) {
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(6, s.fontSize / 8);
        ctx.strokeStyle = "#000000";
        ctx.strokeText(line, x, y);
      }
      ctx.fillStyle = s.textColor;
      ctx.fillText(line, x, y);
      y += lh;
    }
  }
  if (s.badge.trim()) {
    ctx.font = "800 44px Manrope, Arial, sans-serif";
    ctx.textBaseline = "middle";
    const t = s.badge.trim().toUpperCase();
    const w = ctx.measureText(t).width + 48;
    const bx = s.align === "right" ? pad : THUMB_W - pad - w;
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.roundRect(bx, pad - 16, w, 72, 14);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(t, bx + 24, pad + 20);
  }
  ctx.restore();
}
