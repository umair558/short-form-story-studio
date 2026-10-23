import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isPolicyRefusal,
  thumbnailErrorMessage,
  thumbnailInput,
  thumbnailSize,
  THUMBNAIL_EFFECTS,
  THUMBNAIL_STYLES,
  type ThumbnailInput,
} from "@/lib/ai-thumbnail";
import { downloadBlob, fitRect } from "@/lib/image";
import { ImageStreamError, streamImage } from "@/lib/stream-image";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "./auth-provider";
import { SignInPrompt } from "./sign-in-prompt";
import { utcDay } from "@/lib/account-rules";

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
  const [input, setInput] = useState<ThumbnailInput>({
    prompt: "",
    aspectRatio: "16:9",
    style: "Gaming",
    text: "",
    color: "#2563eb",
    effects: [],
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const busy = useRef(false);
  const { user, ready } = useAccount();
  const queryClient = useQueryClient();
  const allowance = useQuery({
    queryKey: ["thumbnail-usage", user?.id],
    enabled: !!user,
    refetchInterval: 60_000,
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("thumbnail_days")
        .select("successful")
        .eq("user_id", user.id)
        .eq("day", utcDay())
        .maybeSingle();
      if (error) throw error;
      return 5 - (data?.successful ?? 0);
    },
  });
  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result.url);
    },
    [result],
  );
  function set<K extends keyof ThumbnailInput>(key: K, value: ThumbnailInput[K]) {
    setInput((previous) => ({ ...previous, [key]: value }));
  }

  async function create() {
    if (busy.current) return;
    if (!user) {
      setError("Sign in to generate thumbnails.");
      return;
    }
    const parsed = thumbnailInput.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your options.");
      return;
    }
    busy.current = true;
    setLoading(true);
    setError(null);
    setDownloaded(false);
    setResult(null);
    setPreview(null);
    const { width, height } = thumbnailSize(parsed.data.aspectRatio);
    let finalUrl: string | null = null;
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session)
        throw new ImageStreamError("Your session expired. Please sign in again.");
      await streamImage(
        "/api/generate-thumbnail",
        parsed.data,
        (url, isFinal) => {
          setPreview(url);
          if (isFinal) finalUrl = url;
        },
        session.session.access_token,
      );
      if (!finalUrl)
        throw new ImageStreamError(
          "The image service returned no image. No thumbnail was generated.",
        );
      let blob: Blob;
      try {
        blob = await toExactPng(finalUrl, width, height);
      } catch {
        throw new ImageStreamError(
          "The generated image could not be read. No thumbnail was generated.",
        );
      }
      setResult({ url: URL.createObjectURL(blob), blob, width, height });
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (e instanceof ImageStreamError && e.status)
        setError(message || thumbnailErrorMessage(e.status));
      else if (isPolicyRefusal(message))
        setError(
          "The image service declined this prompt under its content rules. Try describing original characters instead of named brands, games or real people.",
        );
      else if (e instanceof TypeError)
        setError(
          "The connection was interrupted before the thumbnail finished. Check your connection, then choose Retry manually. A provider charge may still apply; no automatic retry was made.",
        );
      else setError(message || "Image generation failed. No thumbnail was generated.");
    } finally {
      setPreview(null);
      setLoading(false);
      busy.current = false;
      void queryClient.invalidateQueries({ queryKey: ["thumbnail-usage"] });
      void queryClient.invalidateQueries({ queryKey: ["account"] });
    }
  }

  const frame =
    input.aspectRatio === "16:9" ? "aspect-video w-full" : "mx-auto aspect-[9/16] w-full max-w-72";

  if (ready && !user) return <SignInPrompt toolName="the AI Thumbnail Generator" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet">
          <Sparkles size={16} />
          AI Thumbnail Studio
        </span>
        {user ? (
          <p role="status" className="text-sm font-semibold">
            {allowance.data === undefined
              ? allowance.error
                ? "Allowance unavailable"
                : "Checking allowance…"
              : `${allowance.data} / 5 remaining`}{" "}
            <span className="text-xs font-normal text-muted-foreground">· resets 00:00 UTC</span>
          </p>
        ) : (
          <Button asChild variant="outline">
            <Link to="/auth">Sign in to generate</Link>
          </Button>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
      >
        <fieldset disabled={loading} className="thumbnail-toolbar">
          <div className="w-40">
            <label htmlFor="thumbnail-style" className="mb-2 block text-xs font-semibold">
              Style
            </label>
            <select
              id="thumbnail-style"
              className="field"
              value={input.style}
              onChange={(event) => set("style", event.target.value as ThumbnailInput["style"])}
            >
              {THUMBNAIL_STYLES.map((style) => (
                <option key={style}>{style}</option>
              ))}
            </select>
          </div>
          <div className="w-64">
            <label htmlFor="thumbnail-prompt" className="mb-2 block text-xs font-semibold">
              Your topic or thumbnail idea
            </label>
            <input
              id="thumbnail-prompt"
              required
              minLength={10}
              maxLength={1500}
              value={input.prompt}
              onChange={(event) => set("prompt", event.target.value)}
              placeholder="A cinematic mountain adventure…"
              className="field"
            />
          </div>
          <div className="w-44">
            <label htmlFor="thumbnail-format" className="mb-2 block text-xs font-semibold">
              Aspect ratio
            </label>
            <select
              id="thumbnail-format"
              value={input.aspectRatio}
              onChange={(event) =>
                set("aspectRatio", event.target.value as ThumbnailInput["aspectRatio"])
              }
              className="field"
            >
              <option value="16:9">YouTube · 16:9</option>
              <option value="9:16">Shorts · 9:16</option>
            </select>
          </div>
          <div className="w-40">
            <label htmlFor="thumbnail-text" className="mb-2 block text-xs font-semibold">
              Headline text
            </label>
            <input
              id="thumbnail-text"
              maxLength={60}
              value={input.text}
              onChange={(event) => set("text", event.target.value)}
              className="field"
              placeholder="Optional"
            />
          </div>
          <div>
            <label htmlFor="thumbnail-color" className="mb-2 block text-xs font-semibold">
              Accent
            </label>
            <input
              id="thumbnail-color"
              type="color"
              value={input.color}
              onChange={(event) => set("color", event.target.value)}
              className="h-11 w-12 rounded-md border bg-background p-1"
            />
          </div>
          <div className="w-44">
            <label htmlFor="thumbnail-effect" className="mb-2 block text-xs font-semibold">
              Visual effect
            </label>
            <select
              id="thumbnail-effect"
              value={input.effects[0] ?? ""}
              onChange={(event) =>
                set(
                  "effects",
                  event.target.value
                    ? [event.target.value as ThumbnailInput["effects"][number]]
                    : [],
                )
              }
              className="field"
            >
              <option value="">None</option>
              {THUMBNAIL_EFFECTS.map((effect) => (
                <option key={effect}>{effect}</option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            disabled={loading || !ready || !user || allowance.data === 0 || !!allowance.error}
            className="h-11"
          >
            {loading ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            ) : (
              <Sparkles />
            )}
            {loading ? "Generating thumbnail…" : "Generate Thumbnail"}
          </Button>
        </fieldset>
      </form>
      {error && (
        <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <p role="alert" className="break-words text-sm text-destructive">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={loading || !user || allowance.data === 0}
            onClick={() => void create()}
            className="min-h-11"
          >
            <RotateCcw aria-hidden />
            Retry
          </Button>
        </div>
      )}
      <section aria-label="Generated thumbnail" aria-busy={loading} className="pt-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Preview</h2>
          {result && (
            <span className="text-sm text-muted-foreground">
              {result.width} × {result.height} PNG
            </span>
          )}
        </div>
        {result ? (
          <img
            src={result.url}
            alt="Your AI-generated thumbnail"
            className={cn(
              "block rounded-md border object-contain",
              result.width > result.height ? "w-full" : "mx-auto w-full max-w-72",
            )}
          />
        ) : (
          <div
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-md border border-dashed bg-muted px-4 text-center",
              frame,
            )}
          >
            {preview && (
              <img
                src={preview}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition-[filter] motion-reduce:transition-none"
              />
            )}
            {loading ? (
              <div className="relative flex flex-col items-center gap-3 rounded-md bg-background/80 px-4 py-3">
                <LoaderCircle
                  className="h-8 w-8 animate-spin text-violet motion-reduce:animate-none"
                  aria-hidden
                />
                <p role="status" className="text-sm text-muted-foreground">
                  {preview
                    ? "Adding final details…"
                    : "Creating your thumbnail. This can take up to a minute…"}
                </p>
              </div>
            ) : (
              <>
                <ImagePlus className="h-9 w-9 text-muted-foreground" aria-hidden />
                <p className="text-sm text-muted-foreground">No thumbnail generated yet</p>
              </>
            )}
          </div>
        )}
        {result && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                downloadBlob(result.blob, `ai-thumbnail-${result.width}x${result.height}.png`);
                setDownloaded(true);
              }}
              className="h-11 bg-orange text-orange-foreground hover:bg-orange/90"
            >
              <Download aria-hidden />
              Download PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading || !user || allowance.data === 0}
              onClick={() => void create()}
              className="h-11"
            >
              <RotateCcw aria-hidden />
              Regenerate
            </Button>
            {downloaded && (
              <p role="status" className="self-center text-sm text-success">
                Download started
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
