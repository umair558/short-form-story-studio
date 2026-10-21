import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { baseName, downloadBlob, extFor, formatBytes, loadImage, renderImage, validateImageFile, type OutFormat } from "@/lib/image";
import { ImageDrop } from "./image-drop";
import { ErrorNote } from "./ai-list-tool";
import { cn } from "@/lib/utils";

export const PRESETS = [
  { id: "ig-post", label: "Instagram Post", w: 1080, h: 1080 },
  { id: "ig-portrait", label: "Instagram Portrait", w: 1080, h: 1350 },
  { id: "story", label: "Story / Reel / TikTok", w: 1080, h: 1920 },
  { id: "yt-thumb", label: "YouTube Thumbnail", w: 1280, h: 720 },
  { id: "yt-banner", label: "YouTube Banner", w: 2560, h: 1440 },
  { id: "x-post", label: "X / Twitter Post", w: 1600, h: 900 },
  { id: "fb-cover", label: "Facebook Cover", w: 820, h: 312 },
  { id: "custom", label: "Custom size", w: 1080, h: 1080 },
] as const;

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState<string>("ig-post");
  const [cw, setCw] = useState(1080);
  const [ch, setCh] = useState(1080);
  const [mode, setMode] = useState<"cover" | "contain">("cover");
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [out, setOut] = useState<{ blob: Blob; url: string; w: number; h: number } | null>(null);

  useEffect(() => () => { if (out) URL.revokeObjectURL(out.url); }, [out]);

  async function pick(f: File) {
    setError(null);
    setOut(null);
    const v = validateImageFile(f);
    if (v) return setError(v);
    try {
      setFile(f);
      setImg(await loadImage(f));
    } catch (e) {
      setImg(null);
      setError((e as Error).message);
    }
  }

  const p = PRESETS.find((x) => x.id === preset)!;
  const w = preset === "custom" ? cw : p.w;
  const h = preset === "custom" ? ch : p.h;
  const sizeValid = w >= 16 && h >= 16 && w <= 6000 && h <= 6000;

  async function resize() {
    if (!img || !file) return;
    if (!sizeValid) return setError("Width and height must be between 16 and 6000 pixels.");
    setBusy(true);
    setError(null);
    try {
      const blob = await renderImage(img, w, h, { mode, format, quality: format === "image/png" ? undefined : 0.92 });
      setOut({ blob, url: URL.createObjectURL(blob), w, h });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-surface p-5 sm:p-6">
        <ImageDrop onFile={pick} fileName={file?.name} />
        {img && file && (
          <p className="mt-3 text-sm text-muted-foreground">
            Original: {img.naturalWidth} × {img.naturalHeight}px · {formatBytes(file.size)}
          </p>
        )}
      </div>

      <div className="card-surface space-y-5 p-5 sm:p-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Target size</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRESETS.map((x) => (
              <label key={x.id} className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-sm", preset === x.id && "border-primary bg-primary-soft")}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="preset" value={x.id} checked={preset === x.id} onChange={() => setPreset(x.id)} className="accent-primary" />
                  {x.label}
                </span>
                {x.id !== "custom" && <span className="text-muted-foreground">{x.w}×{x.h}</span>}
              </label>
            ))}
          </div>
        </fieldset>
        {preset === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cw" className="mb-1.5 block text-sm font-medium">Width (px)</label>
              <input id="cw" type="number" inputMode="numeric" min={16} max={6000} className="field" value={cw} onChange={(e) => setCw(Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="ch" className="mb-1.5 block text-sm font-medium">Height (px)</label>
              <input id="ch" type="number" inputMode="numeric" min={16} max={6000} className="field" value={ch} onChange={(e) => setCh(Number(e.target.value))} />
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="mode" className="mb-1.5 block text-sm font-medium">Fit</label>
            <select id="mode" className="field" value={mode} onChange={(e) => setMode(e.target.value as "cover" | "contain")}>
              <option value="cover">Crop to fill (no borders)</option>
              <option value="contain">Fit whole image (adds borders)</option>
            </select>
          </div>
          <div>
            <label htmlFor="fmt" className="mb-1.5 block text-sm font-medium">Output format</label>
            <select id="fmt" className="field" value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
        </div>
        <button type="button" onClick={resize} disabled={!img || busy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {img ? `Resize to ${w} × ${h}` : "Choose an image first"}
        </button>
      </div>

      {error && <ErrorNote message={error} />}

      {out && file && (
        <section aria-labelledby="resized-title" className="card-surface p-5 sm:p-6">
          <h2 id="resized-title" className="text-lg font-semibold">Resized image</h2>
          <p className="mt-1 text-sm text-muted-foreground">{out.w} × {out.h}px · {formatBytes(out.blob.size)}</p>
          <div className="mt-4 flex justify-center rounded-lg border bg-muted p-3">
            <img src={out.url} alt="Resized preview" className="max-h-96 w-auto max-w-full object-contain" style={{ aspectRatio: `${out.w}/${out.h}` }} />
          </div>
          <button type="button" onClick={() => downloadBlob(out.blob, `${baseName(file.name)}-${out.w}x${out.h}.${extFor(format)}`)} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto">
            <Download className="h-4 w-4" aria-hidden /> Download
          </button>
        </section>
      )}
    </div>
  );
}
