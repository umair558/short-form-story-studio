import { Download, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { canvasToBlob, downloadBlob, formatBytes, loadImage, validateImageFile, type OutFormat } from "@/lib/image";
import { DEFAULT_THUMB, drawThumbnail, THUMB_H, THUMB_W, type ThumbState } from "@/lib/thumbnail";
import { ImageDrop } from "./image-drop";
import { ErrorNote } from "./ai-list-tool";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

function Range({ id, label, min, max, step = 1, value, onChange, unit = "" }: { id: string; label: string; min: number; max: number; step?: number; value: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 flex justify-between text-sm font-medium"><span>{label}</span><span className="text-muted-foreground">{value}{unit}</span></label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

function Seg<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((o) => (
          <Button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={cn("h-9 rounded-md border text-sm capitalize", value === o ? "border-primary bg-primary-soft font-semibold text-primary" : "hover:bg-muted")}>{o}</Button>
        ))}
      </div>
    </fieldset>
  );
}

export function ThumbnailMaker() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState<ThumbState>(DEFAULT_THUMB);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>();
  const [format, setFormat] = useState<OutFormat>("image/jpeg");
  const [error, setError] = useState<string | null>(null);
  const [lastSize, setLastSize] = useState<number | null>(null);
  const set = <K extends keyof ThumbState>(k: K, v: ThumbState[K]) => setS((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    drawThumbnail(ctx, s, img);
    // Redraw once web fonts are ready so Manrope is used.
    document.fonts?.ready.then(() => drawThumbnail(ctx, s, img));
  }, [s, img]);

  async function pick(f: File) {
    setError(null);
    const v = validateImageFile(f);
    if (v) return setError(v);
    try {
      setImg(await loadImage(f));
      setFileName(f.name);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function exportImage() {
    if (!canvas.current) return;
    try {
      const blob = await canvasToBlob(canvas.current, format, format === "image/png" ? undefined : 0.92);
      setLastSize(blob.size);
      downloadBlob(blob, `youtube-thumbnail-1280x720.${format === "image/png" ? "png" : "jpg"}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="thumbnail-toolbar order-first items-start border-b" aria-label="Thumbnail settings">
      <div className="shrink-0 w-80 space-y-4 border-r pr-5">
        <h2 className="text-base font-semibold">1. Background</h2>
        <ImageDrop onFile={pick} fileName={fileName} />
        {img && (
          <Button type="button" onClick={() => { setImg(null); setFileName(undefined); }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Trash2 className="h-4 w-4" aria-hidden /> Remove image
          </Button>
        )}
        <div className="flex items-center gap-3">
          <label htmlFor="bg" className="text-sm font-medium">Background colour</label>
          <input id="bg" type="color" value={s.bgColor} onChange={(e) => set("bgColor", e.target.value)} className="h-9 w-14 cursor-pointer rounded border" />
        </div>
        {img && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Range id="zoom" label="Zoom" min={1} max={3} step={0.05} value={s.zoom} onChange={(v) => set("zoom", v)} unit="×" />
            <Range id="ox" label="Move left / right" min={-1} max={1} step={0.02} value={s.offsetX} onChange={(v) => set("offsetX", v)} />
            <Range id="oy" label="Move up / down" min={-1} max={1} step={0.02} value={s.offsetY} onChange={(v) => set("offsetY", v)} />
            <Range id="br" label="Brightness" min={50} max={150} value={s.brightness} onChange={(v) => set("brightness", v)} unit="%" />
            <Range id="ct" label="Contrast" min={50} max={150} value={s.contrast} onChange={(v) => set("contrast", v)} unit="%" />
            <Range id="sat" label="Saturation" min={0} max={200} value={s.saturation} onChange={(v) => set("saturation", v)} unit="%" />
          </div>
        )}
        <Range id="ov" label="Dark overlay" min={0} max={80} value={s.overlay} onChange={(v) => set("overlay", v)} unit="%" />
      </div>

      <div className="shrink-0 w-80 space-y-4 border-r pr-5">
        <h2 className="text-base font-semibold">2. Text</h2>
        <div>
          <label htmlFor="headline" className="mb-1.5 block text-sm font-medium">Headline</label>
          <textarea id="headline" className="field min-h-20" maxLength={80} value={s.headline} onChange={(e) => set("headline", e.target.value)} />
        </div>
        <Range id="fs" label="Text size" min={48} max={200} value={s.fontSize} onChange={(v) => set("fontSize", v)} unit="px" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Seg label="Horizontal" options={["left", "center", "right"] as const} value={s.align} onChange={(v) => set("align", v)} />
          <Seg label="Vertical" options={["top", "middle", "bottom"] as const} value={s.vAlign} onChange={(v) => set("vAlign", v)} />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label className="flex items-center gap-2"><input type="color" value={s.textColor} onChange={(e) => set("textColor", e.target.value)} className="h-9 w-14 cursor-pointer rounded border" /> Text colour</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={s.stroke} onChange={(e) => set("stroke", e.target.checked)} className="h-4 w-4 accent-primary" /> Black outline</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={s.highlight} onChange={(e) => set("highlight", e.target.checked)} className="h-4 w-4 accent-primary" /> Highlight bar</label>
          {s.highlight && <label className="flex items-center gap-2"><input type="color" value={s.highlightColor} onChange={(e) => set("highlightColor", e.target.value)} className="h-9 w-14 cursor-pointer rounded border" /> Bar colour</label>}
        </div>
        <div>
          <label htmlFor="badge" className="mb-1.5 block text-sm font-medium">Corner badge <span className="font-normal text-muted-foreground">(optional, e.g. NEW, PART 2)</span></label>
          <input id="badge" className="field" maxLength={16} value={s.badge} onChange={(e) => set("badge", e.target.value)} />
        </div>
      </div>
      </div>
      <div className="border-b pb-4">
        <canvas ref={canvas} width={THUMB_W} height={THUMB_H} aria-label="Thumbnail preview" role="img" className="block h-auto w-full rounded-md border" />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <select aria-label="Export format" className="field sm:w-36" value={format} onChange={(e) => setFormat(e.target.value as OutFormat)}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>
          <Button type="button" onClick={exportImage} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange px-6 font-semibold text-orange-foreground hover:bg-orange/90">
            <Download className="h-4 w-4" aria-hidden /> Download 1280×720
          </Button>
          <Button type="button" onClick={() => setS(DEFAULT_THUMB)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted">
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset design
          </Button>
        </div>
        {lastSize !== null && <p className="mt-2 text-sm text-muted-foreground">Last export: {formatBytes(lastSize)}{lastSize > 2 * 1024 * 1024 ? " — over YouTube's 2 MB limit, try JPG." : ""}</p>}
      </div>

      {error && <ErrorNote message={error} />}

    </div>
  );
}
