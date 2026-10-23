import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPolicyRefusal, thumbnailErrorMessage, thumbnailInput, thumbnailSize, THUMBNAIL_EFFECTS, THUMBNAIL_STYLES, type ThumbnailInput } from "@/lib/ai-thumbnail";
import { downloadBlob, fitRect } from "@/lib/image";
import { ImageStreamError, streamImage } from "@/lib/stream-image";
import { cn } from "@/lib/utils";

type Result = { url: string; blob: Blob; width: number; height: number };

/** Decodes the generated image and exports it as a PNG at the exact thumbnail size. */
async function toExactPng(dataUrl: string, width: number, height: number): Promise<Blob> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("empty");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const r = fitRect(image.naturalWidth, image.naturalHeight, width, height, "cover");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, r.sx, r.sy, r.sw, r.sh, r.dx, r.dy, r.dw, r.dh);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("export");
  return blob;
}

export function AiThumbnailGenerator() {
  const [input, setInput] = useState<ThumbnailInput>({ prompt: "", aspectRatio: "16:9", style: "Gaming", text: "", color: "#2563eb", effects: [] });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const busy = useRef(false);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  function set<K extends keyof ThumbnailInput>(key: K, value: ThumbnailInput[K]) { setInput((previous) => ({ ...previous, [key]: value })); }

  async function create() {
    if (busy.current) return;
    const parsed = thumbnailInput.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Please check your options."); return; }
    busy.current = true;
    setLoading(true); setError(null); setDownloaded(false); setResult(null); setPreview(null);
    const { width, height } = thumbnailSize(parsed.data.aspectRatio);
    let finalUrl: string | null = null;
    try {
      await streamImage("/api/generate-thumbnail", parsed.data, (url, isFinal) => { setPreview(url); if (isFinal) finalUrl = url; });
      if (!finalUrl) throw new ImageStreamError("The image service returned no image. No thumbnail was generated.");
      let blob: Blob;
      try { blob = await toExactPng(finalUrl, width, height); } catch { throw new ImageStreamError("The generated image could not be read. No thumbnail was generated."); }
      setResult({ url: URL.createObjectURL(blob), blob, width, height });
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (e instanceof ImageStreamError && e.status) setError(message || thumbnailErrorMessage(e.status));
      else if (isPolicyRefusal(message)) setError("The image service declined this prompt under its content rules. Try describing original characters instead of named brands, games or real people.");
      else setError(message || "Image generation failed. No thumbnail was generated.");
    } finally {
      setPreview(null); setLoading(false); busy.current = false;
    }
  }

  const frame = input.aspectRatio === "16:9" ? "aspect-video w-full" : "mx-auto aspect-[9/16] w-full max-w-72";

  return <div className="space-y-6">
    <form onSubmit={(event) => { event.preventDefault(); void create(); }} className="space-y-5">
      <fieldset disabled={loading} className="min-w-0 space-y-5">
        <div><label htmlFor="thumbnail-prompt" className="mb-2 block font-semibold">Your topic or thumbnail idea</label><textarea id="thumbnail-prompt" required minLength={10} maxLength={1500} value={input.prompt} onChange={(event) => set("prompt", event.target.value)} placeholder="A soldier in tactical gear holding a rifle in a burning battle zone, final circle closing in" className="field min-h-32 resize-y" /><p className="mt-1 text-right text-xs text-muted-foreground">{input.prompt.length}/1500</p></div>
        <fieldset><legend className="mb-2 text-sm font-semibold">Style</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{THUMBNAIL_STYLES.map((style) => <Button key={style} type="button" variant="outline" aria-pressed={input.style === style} onClick={() => set("style", style)} className={cn("min-h-11", input.style === style && "border-violet bg-violet-soft text-violet")}>{style}</Button>)}</div></fieldset>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]"><div><label htmlFor="thumbnail-text" className="mb-2 block text-sm font-semibold">Headline text <span className="font-normal text-muted-foreground">(optional, short works best)</span></label><input id="thumbnail-text" maxLength={60} value={input.text} onChange={(event) => set("text", event.target.value)} className="field" placeholder="FINAL ZONE" /></div><div><label htmlFor="thumbnail-color" className="mb-2 block text-sm font-semibold">Accent color</label><input id="thumbnail-color" type="color" value={input.color} onChange={(event) => set("color", event.target.value)} className="h-11 w-20 cursor-pointer rounded-md border bg-background p-1" /></div></div>
        <fieldset><legend className="mb-2 text-sm font-semibold">Format</legend><div className="grid grid-cols-2 gap-3">{(["16:9", "9:16"] as const).map((ratio) => { const s = thumbnailSize(ratio); return <Button key={ratio} type="button" variant="outline" aria-pressed={input.aspectRatio === ratio} onClick={() => set("aspectRatio", ratio)} className={cn("h-auto min-h-16 flex-col gap-1 whitespace-normal px-2", input.aspectRatio === ratio && "border-primary bg-primary-soft text-primary")}><span>{ratio === "16:9" ? "YouTube thumbnail" : "Shorts cover"}</span><span className="text-xs">{ratio} · {s.width}×{s.height}</span></Button>; })}</div></fieldset>
        <fieldset><legend className="mb-2 text-sm font-semibold">Extra effects <span className="font-normal text-muted-foreground">(optional)</span></legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{THUMBNAIL_EFFECTS.map((effect) => <label key={effect} className="flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm"><input type="checkbox" className="h-4 w-4 shrink-0 accent-primary" checked={input.effects.includes(effect)} onChange={(event) => set("effects", event.target.checked ? [...input.effects, effect] : input.effects.filter((value) => value !== effect))} />{effect}</label>)}</div></fieldset>
      </fieldset>
      <Button type="submit" disabled={loading} className="h-12 w-full text-base">{loading ? <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden /> : <Sparkles aria-hidden />}{loading ? "Generating thumbnail…" : "Generate Thumbnail"}</Button>
    </form>
    {error && <div role="alert" className="break-words rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
    <section aria-label="Generated thumbnail" aria-busy={loading} className="border-t pt-6">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">Preview</h2>{result && <span className="text-sm text-muted-foreground">{result.width} × {result.height} PNG</span>}</div>
      {result ? <img src={result.url} alt="Your AI-generated thumbnail" className={cn("block rounded-md border object-contain", result.width > result.height ? "w-full" : "mx-auto w-full max-w-72")} />
        : <div className={cn("relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-md border border-dashed bg-muted px-4 text-center", frame)}>
          {preview && <img src={preview} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition-[filter] motion-reduce:transition-none" />}
          {loading ? <div className="relative flex flex-col items-center gap-3 rounded-md bg-background/80 px-4 py-3"><LoaderCircle className="h-8 w-8 animate-spin text-violet motion-reduce:animate-none" aria-hidden /><p role="status" className="text-sm text-muted-foreground">{preview ? "Adding final details…" : "Creating your thumbnail. This can take up to a minute…"}</p></div>
            : <><ImagePlus className="h-9 w-9 text-muted-foreground" aria-hidden /><p className="text-sm text-muted-foreground">No thumbnail generated yet</p></>}
        </div>}
      {result && <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button type="button" onClick={() => { downloadBlob(result.blob, `ai-thumbnail-${result.width}x${result.height}.png`); setDownloaded(true); }} className="h-11 bg-orange text-orange-foreground hover:bg-orange/90"><Download aria-hidden />Download PNG</Button><Button type="button" variant="outline" disabled={loading} onClick={() => void create()} className="h-11"><RotateCcw aria-hidden />Regenerate</Button>{downloaded && <p role="status" className="self-center text-sm text-success">Download started</p>}</div>}
    </section>
  </div>;
}
