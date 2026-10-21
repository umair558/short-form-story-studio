export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/avif"];
export const MAX_BYTES = 25 * 1024 * 1024;

export type OutFormat = "image/jpeg" | "image/png" | "image/webp";

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Unsupported file type. Please use JPG, PNG, WebP, GIF, BMP or AVIF.";
  if (file.size > MAX_BYTES) return "This image is larger than 25 MB. Please choose a smaller file.";
  if (file.size === 0) return "This file is empty.";
  return null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export interface Rect { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number }

/** Geometry for placing a source image into a target box. "cover" crops to fill, "contain" fits with padding. */
export function fitRect(srcW: number, srcH: number, dstW: number, dstH: number, mode: "cover" | "contain"): Rect {
  const scale = mode === "cover" ? Math.max(dstW / srcW, dstH / srcH) : Math.min(dstW / srcW, dstH / srcH);
  if (mode === "cover") {
    const sw = dstW / scale;
    const sh = dstH / scale;
    return { sx: (srcW - sw) / 2, sy: (srcH - sh) / 2, sw, sh, dx: 0, dy: 0, dw: dstW, dh: dstH };
  }
  const dw = srcW * scale;
  const dh = srcH * scale;
  return { sx: 0, sy: 0, sw: srcW, sh: srcH, dx: (dstW - dw) / 2, dy: (dstH - dh) / 2, dw, dh };
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } catch {
    throw new Error("This image couldn't be read. It may be corrupted or in a format your browser doesn't support.");
  } finally {
    // Keep URL alive until decode finishes; revoke after.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: OutFormat, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create the output image."))), type, quality),
  );
}

export async function renderImage(
  img: HTMLImageElement,
  width: number,
  height: number,
  opts: { mode: "cover" | "contain"; format: OutFormat; quality?: number; background?: string },
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser doesn't support image processing.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // JPEG has no transparency: fill a background so transparent pixels don't become black.
  if (opts.format === "image/jpeg" || opts.mode === "contain") {
    ctx.fillStyle = opts.background ?? "#ffffff";
    if (opts.format !== "image/jpeg" && !opts.background) ctx.clearRect(0, 0, width, height);
    else ctx.fillRect(0, 0, width, height);
  }
  const r = fitRect(img.naturalWidth, img.naturalHeight, width, height, opts.mode);
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, r.dx, r.dy, r.dw, r.dh);
  return canvasToBlob(canvas, opts.format, opts.quality);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function extFor(type: OutFormat) {
  return type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
}

export function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "image";
}
