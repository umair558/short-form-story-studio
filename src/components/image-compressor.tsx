import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { baseName, downloadBlob, extFor, formatBytes, loadImage, renderImage, validateImageFile, type OutFormat } from "@/lib/image";
import { ImageDrop } from "./image-drop";
import { ErrorNote } from "./ai-list-tool";

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<Exclude<OutFormat, "image/png">>("image/jpeg");
  const [maxW, setMaxW] = useState<number>(0);
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

  async function compress() {
    if (!img) return;
    setBusy(true);
    setError(null);
    try {
      const scale = maxW && img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const blob = await renderImage(img, w, h, { mode: "cover", format, quality: quality / 100 });
      setOut({ blob, url: URL.createObjectURL(blob), w, h });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const saved = out && file ? Math.round((1 - out.blob.size / file.size) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="card-surface p-5 sm:p-6">
        <ImageDrop onFile={pick} fileName={file?.name} />
      </div>
      <div className="card-surface space-y-5 p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="quality" className="text-sm font-medium">Quality</label>
            <span className="text-sm font-semibold text-primary" aria-hidden>{quality}%</span>
          </div>
          <input id="quality" type="range" min={10} max={100} step={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 w-full accent-primary" aria-valuetext={`${quality} percent`} />
          <p className="mt-1 text-xs text-muted-foreground">60–80% is a good balance for social media.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cfmt" className="mb-1.5 block text-sm font-medium">Output format</label>
            <select id="cfmt" className="field" value={format} onChange={(e) => setFormat(e.target.value as "image/jpeg" | "image/webp")}>
              <option value="image/jpeg">JPG (most compatible)</option>
              <option value="image/webp">WebP (usually smaller)</option>
            </select>
          </div>
          <div>
            <label htmlFor="maxw" className="mb-1.5 block text-sm font-medium">Max width</label>
            <select id="maxw" className="field" value={maxW} onChange={(e) => setMaxW(Number(e.target.value))}>
              <option value={0}>Keep original size</option>
              <option value={2560}>2560px</option>
              <option value={1920}>1920px</option>
              <option value={1080}>1080px</option>
              <option value={720}>720px</option>
            </select>
          </div>
        </div>
        <button type="button" onClick={compress} disabled={!img || busy} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {img ? "Compress image" : "Choose an image first"}
        </button>
      </div>

      {error && <ErrorNote message={error} />}

      {out && file && (
        <section aria-labelledby="comp-title" className="card-surface p-5 sm:p-6">
          <h2 id="comp-title" className="text-lg font-semibold">Compressed image</h2>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted p-3"><dt className="text-xs text-muted-foreground">Original</dt><dd className="font-semibold">{formatBytes(file.size)}</dd></div>
            <div className="rounded-lg bg-muted p-3"><dt className="text-xs text-muted-foreground">Compressed</dt><dd className="font-semibold">{formatBytes(out.blob.size)}</dd></div>
            <div className="rounded-lg bg-primary-soft p-3"><dt className="text-xs text-muted-foreground">Change</dt><dd className="font-semibold text-primary">{saved >= 0 ? `−${saved}%` : `+${-saved}%`}</dd></div>
          </dl>
          {saved < 0 && (
            <p className="mt-3 text-sm text-warning-foreground">The result is larger than the original — the file was already well optimized. Try lower quality or a smaller max width.</p>
          )}
          <div className="mt-4 flex justify-center rounded-lg border bg-muted p-3">
            <img src={out.url} alt="Compressed preview" className="max-h-96 w-auto max-w-full object-contain" style={{ aspectRatio: `${out.w}/${out.h}` }} />
          </div>
          <button type="button" onClick={() => downloadBlob(out.blob, `${baseName(file.name)}-compressed.${extFor(format)}`)} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto">
            <Download className="h-4 w-4" aria-hidden /> Download ({formatBytes(out.blob.size)})
          </button>
        </section>
      )}
    </div>
  );
}
