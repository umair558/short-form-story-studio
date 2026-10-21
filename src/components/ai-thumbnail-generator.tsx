import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, ImagePlus, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateThumbnail } from "@/lib/ai-thumbnail.functions";
import { thumbnailInput, THUMBNAIL_EFFECTS, THUMBNAIL_STYLES, type ThumbnailInput } from "@/lib/ai-thumbnail";
import { downloadBlob } from "@/lib/image";
import { cn } from "@/lib/utils";

type Result = { url: string; blob: Blob; width: number; height: number; extension: string };
export function AiThumbnailGenerator() {
  const [input, setInput] = useState<ThumbnailInput>({ prompt: "", aspectRatio: "16:9", style: "Gaming", text: "", color: "#2563eb", effects: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const busy = useRef(false);
  const generate = useServerFn(generateThumbnail);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  function set<K extends keyof ThumbnailInput>(key: K, value: ThumbnailInput[K]) { setInput((previous) => ({ ...previous, [key]: value })); }

  async function create() {
    if (busy.current) return;
    const parsed = thumbnailInput.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Please check your options."); return; }
    busy.current = true;
    setLoading(true); setError(null); setDownloaded(false); setResult(null);
    let imageUrl: string | undefined;
    try {
      const response = await generate({ data: parsed.data });
      if (!response.ok) { setError(response.error); return; }
      const bytes = Uint8Array.from(atob(response.data), (character) => character.charCodeAt(0));
      const blob = new Blob([bytes], { type: response.mimeType });
      imageUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.src = imageUrl;
      await image.decode();
      if (image.naturalWidth < 1280 && image.naturalHeight < 1280) throw new Error("Google returned an image below HD resolution. No HD thumbnail was generated.");
      setResult({ url: imageUrl, blob, width: image.naturalWidth, height: image.naturalHeight, extension: response.mimeType === "image/png" ? "png" : "jpg" });
      imageUrl = undefined;
    } catch (e) {
      setError(e instanceof Error ? e.message : "The generated image could not be read. No thumbnail was generated.");
    } finally {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setLoading(false); busy.current = false;
    }
  }

  return <div className="space-y-6">
    <form onSubmit={(event) => { event.preventDefault(); void create(); }} className="space-y-5">
      <fieldset disabled={loading} className="min-w-0 space-y-5">
        <div><label htmlFor="thumbnail-prompt" className="mb-2 block font-semibold">Your thumbnail idea</label><textarea id="thumbnail-prompt" required minLength={10} maxLength={1500} value={input.prompt} onChange={(event) => set("prompt", event.target.value)} placeholder="Epic PUBG gaming thumbnail with fire effects and a character holding M416" className="field min-h-32 resize-y" /><p className="mt-1 text-right text-xs text-muted-foreground">{input.prompt.length}/1500</p></div>
        <fieldset><legend className="mb-2 text-sm font-semibold">Format</legend><div className="grid grid-cols-2 gap-3">{(["16:9", "9:16"] as const).map((ratio) => <Button key={ratio} type="button" variant="outline" aria-pressed={input.aspectRatio === ratio} onClick={() => set("aspectRatio", ratio)} className={cn("h-auto min-h-16 flex-col gap-1 whitespace-normal px-2", input.aspectRatio === ratio && "border-primary bg-primary-soft text-primary")}><span>{ratio === "16:9" ? "YouTube thumbnail" : "Shorts cover"}</span><span className="text-xs">{ratio} · 2K HD</span></Button>)}</div></fieldset>
        <fieldset><legend className="mb-2 text-sm font-semibold">Style</legend><div className="flex flex-wrap gap-2">{THUMBNAIL_STYLES.map((style) => <Button key={style} type="button" variant="outline" aria-pressed={input.style === style} onClick={() => set("style", style)} className={cn("min-h-11", input.style === style && "border-violet bg-violet-soft text-violet")}>{style}</Button>)}</div></fieldset>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]"><div><label htmlFor="thumbnail-text" className="mb-2 block text-sm font-semibold">Custom headline <span className="font-normal text-muted-foreground">(optional)</span></label><input id="thumbnail-text" maxLength={80} value={input.text} onChange={(event) => set("text", event.target.value)} className="field" placeholder="EPIC FINAL ZONE" /></div><div><label htmlFor="thumbnail-color" className="mb-2 block text-sm font-semibold">Accent color</label><input id="thumbnail-color" type="color" value={input.color} onChange={(event) => set("color", event.target.value)} className="h-11 w-20 cursor-pointer rounded-md border bg-background p-1" /></div></div>
        <fieldset><legend className="mb-2 text-sm font-semibold">Visual effects</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{THUMBNAIL_EFFECTS.map((effect) => <label key={effect} className="flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm"><input type="checkbox" className="h-4 w-4 shrink-0 accent-primary" checked={input.effects.includes(effect)} onChange={(event) => set("effects", event.target.checked ? [...input.effects, effect] : input.effects.filter((value) => value !== effect))} />{effect}</label>)}</div></fieldset>
      </fieldset>
      <Button type="submit" disabled={loading} className="h-12 w-full text-base"><Sparkles aria-hidden />{loading ? "Generating thumbnail…" : "Generate AI Thumbnail"}</Button>
    </form>
    {error && <div role="alert" className="break-words rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
    <section aria-label="Generated thumbnail" aria-busy={loading} className="border-t pt-6">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">Preview</h2>{result && <span className="text-sm text-muted-foreground">{result.width} × {result.height}</span>}</div>
      {result ? <img src={result.url} alt="Your AI-generated thumbnail" className="mx-auto block max-h-[640px] w-auto max-w-full rounded-md border object-contain" /> : <div className={cn("flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted px-4 text-center", input.aspectRatio === "16:9" ? "aspect-video" : "mx-auto aspect-[9/16] w-full max-w-72")}>
        {loading ? <><LoaderCircle className="h-8 w-8 animate-spin text-violet motion-reduce:animate-none" aria-hidden /><p role="status" className="text-sm text-muted-foreground">Google is creating your image…</p></> : <><ImagePlus className="h-9 w-9 text-muted-foreground" aria-hidden /><p className="text-sm text-muted-foreground">No thumbnail generated yet</p></>}
      </div>}
      {result && <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button type="button" onClick={() => { downloadBlob(result.blob, `ai-thumbnail-${result.width}x${result.height}.${result.extension}`); setDownloaded(true); }} className="h-11 bg-orange text-orange-foreground hover:bg-orange/90"><Download aria-hidden />Download HD</Button><Button type="button" variant="outline" disabled={loading} onClick={() => void create()} className="h-11"><RotateCcw aria-hidden />Regenerate</Button>{downloaded && <p role="status" className="self-center text-sm text-success">Download started</p>}</div>}
    </section>
  </div>;
}