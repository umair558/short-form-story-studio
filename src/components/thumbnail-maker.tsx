import {
  Download, Image as ImageIcon, LoaderCircle, Redo2, RotateCcw, SlidersHorizontal,
  Sparkles, Stamp, Trash2, Type, Undo2, Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "./auth-provider";
import {
  canvasToBlob, downloadBlob, loadImage, validateImageFile,
} from "@/lib/image";
import {
  applyPreset, DEFAULT_THUMB, drawThumbnail, makeText, STYLE_PRESETS,
  TEXT_FONTS, THUMB_H, THUMB_W,
  type TextLayer, type ThumbState, type ThumbStyle,
} from "@/lib/thumbnail";
import {
  isPolicyRefusal, thumbnailErrorMessage, thumbnailInput, THUMBNAIL_STYLES,
} from "@/lib/ai-thumbnail";
import { ImageStreamError, streamImage } from "@/lib/stream-image";
import { utcDay } from "@/lib/account-rules";
import { ErrorNote } from "./ai-list-tool";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Panel = "image" | "adjust" | "text" | "style" | "ai" | "logo" | null;

const TABS: { id: Exclude<Panel, null>; label: string; icon: typeof ImageIcon }[] = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
  { id: "text", label: "Text", icon: Type },
  { id: "style", label: "Style", icon: Wand2 },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "logo", label: "Logo", icon: Stamp },
];

function Range({ id, label, min, max, step = 1, value, onChange, unit = "" }: {
  id: string; label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="min-w-36 flex-1">
      <label htmlFor={id} className="mb-1 flex justify-between gap-2 text-xs font-medium text-zinc-300">
        <span>{label}</span>
        <span className="text-zinc-500">{value}{unit}</span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-orange-500" />
    </div>
  );
}

function ColorField({ id, label, value, onChange }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-xs font-medium text-zinc-300">
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-zinc-800 p-0.5" />
      {label}
    </label>
  );
}

function Check({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-orange-500" />
      {label}
    </label>
  );
}

const darkField =
  "h-9 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none";

export function ThumbnailMaker() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState<ThumbState>(DEFAULT_THUMB);
  const [past, setPast] = useState<ThumbState[]>([]);
  const [future, setFuture] = useState<ThumbState[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [activeText, setActiveText] = useState<string>(DEFAULT_THUMB.texts[0]!.id);
  const [error, setError] = useState<string | null>(null);

  // AI panel state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState<(typeof THUMBNAIL_STYLES)[number]>("Gaming");
  const [aiLoading, setAiLoading] = useState(false);
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
        .from("thumbnail_days").select("successful")
        .eq("user_id", user.id).eq("day", utcDay()).maybeSingle();
      if (error) throw error;
      return 5 - (data?.successful ?? 0);
    },
  });

  /** Commit a state change with undo history. */
  function commit(next: ThumbState | ((p: ThumbState) => ThumbState)) {
    setS((p) => {
      const n = typeof next === "function" ? next(p) : next;
      setPast((h) => [...h.slice(-29), p]);
      setFuture([]);
      return n;
    });
  }
  const set = <K extends keyof ThumbState>(k: K, v: ThumbState[K]) =>
    commit((p) => ({ ...p, [k]: v }));

  function undo() {
    setPast((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      if (!prev) return h;
      setFuture((f) => [s, ...f]);
      setS(prev);
      return h.slice(0, -1);
    });
  }
  function redo() {
    setFuture((f) => {
      if (!f.length) return f;
      const [next, ...rest] = f;
      if (!next) return f;
      setPast((h) => [...h, s]);
      setS(next);
      return rest;
    });
  }

  // Load image elements when URLs change
  useEffect(() => {
    let live = true;
    if (!s.image) { setBgImg(null); return; }
    const img = new Image();
    img.src = s.image;
    img.decode().then(() => { if (live) setBgImg(img); }).catch(() => {
      if (live) setError("The background image could not be read.");
    });
    return () => { live = false; };
  }, [s.image]);
  useEffect(() => {
    let live = true;
    if (!s.logo) { setLogoImg(null); return; }
    const img = new Image();
    img.src = s.logo.url;
    img.decode().then(() => { if (live) setLogoImg(img); }).catch(() => {});
    return () => { live = false; };
  }, [s.logo]);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    drawThumbnail(ctx, s, { bg: bgImg, logo: logoImg });
    document.fonts?.ready.then(() => drawThumbnail(ctx, s, { bg: bgImg, logo: logoImg }));
  }, [s, bgImg, logoImg]);

  async function pickFile(f: File, target: "bg" | "logo") {
    setError(null);
    const v = validateImageFile(f);
    if (v) return setError(v);
    try {
      await loadImage(f); // validates the file decodes
      const url = URL.createObjectURL(f); // loadImage revokes its own URL, so keep our own
      if (target === "bg") commit((p) => ({ ...p, image: url }));
      else commit((p) => ({ ...p, logo: { url, x: 0.88, y: 0.14, size: 0.16 } }));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function updateText(id: string, patch: Partial<TextLayer>) {
    commit((p) => ({ ...p, texts: p.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }

  async function generate() {
    if (busy.current) return;
    if (!user) { setError("Sign in to generate AI images."); return; }
    const parsed = thumbnailInput.safeParse({
      prompt: aiPrompt, aspectRatio: "16:9", style: aiStyle, text: "", color: "#2563eb", effects: [],
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please describe your thumbnail (at least 10 characters).");
      return;
    }
    busy.current = true;
    setAiLoading(true);
    setError(null);
    let finalUrl: string | null = null;
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new ImageStreamError("Your session expired. Please sign in again.");
      await streamImage("/api/generate-thumbnail", parsed.data, (url, isFinal) => {
        if (isFinal) finalUrl = url;
      }, session.session.access_token);
      if (!finalUrl) throw new ImageStreamError("The image service returned no image.");
      const img = new Image();
      img.src = finalUrl;
      await img.decode();
      if (!img.naturalWidth) throw new ImageStreamError("The generated image could not be read.");
      commit((p) => ({ ...p, image: finalUrl, fit: "cover", zoom: 1, offsetX: 0, offsetY: 0 }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (e instanceof ImageStreamError && e.status) setError(message || thumbnailErrorMessage(e.status));
      else if (isPolicyRefusal(message))
        setError("The image service declined this prompt under its content rules. Try describing original characters instead of named brands, games or real people.");
      else if (e instanceof TypeError)
        setError("The connection was interrupted before the image finished. Check your connection, then use Generate again manually. No automatic retry was made.");
      else setError(message || "Image generation failed.");
    } finally {
      setAiLoading(false);
      busy.current = false;
      void queryClient.invalidateQueries({ queryKey: ["thumbnail-usage"] });
      void queryClient.invalidateQueries({ queryKey: ["account"] });
    }
  }

  async function exportPng() {
    if (!canvas.current) return;
    try {
      const blob = await canvasToBlob(canvas.current, "image/png");
      downloadBlob(blob, "youtube-thumbnail-1280x720.png");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const text = s.texts.find((t) => t.id === activeText) ?? s.texts[0] ?? null;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-3 py-2">
        <span className="mr-auto text-sm font-semibold">Thumbnail Studio</span>
        <Button type="button" variant="ghost" size="sm" onClick={undo} disabled={!past.length}
          aria-label="Undo" className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={redo} disabled={!future.length}
          aria-label="Redo" className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm"
          onClick={() => { commit(DEFAULT_THUMB); setActiveText(DEFAULT_THUMB.texts[0]!.id); }}
          className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <Button type="button" size="sm" onClick={exportPng}
          className="bg-orange-500 font-semibold text-white hover:bg-orange-600">
          <Download className="h-4 w-4" /> Download PNG
        </Button>
      </div>

      {/* Preview */}
      <div className="bg-zinc-900 p-3 sm:p-4">
        <canvas ref={canvas} width={THUMB_W} height={THUMB_H} role="img"
          aria-label="Thumbnail preview"
          className="mx-auto block h-auto w-full max-w-3xl rounded-lg border border-zinc-700" />
        <p className="mt-1.5 text-center text-xs text-zinc-500">1280 × 720 · 16:9</p>
      </div>

      {error && (
        <div className="border-t border-zinc-800 px-3 py-2">
          <ErrorNote message={error} />
        </div>
      )}

      {/* Editing panel */}
      {panel && (
        <div className="max-h-64 overflow-y-auto border-t border-zinc-800 bg-zinc-900 px-3 py-3 sm:px-4">
          {panel === "image" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-700">
                  <ImageIcon className="h-4 w-4" /> {s.image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickFile(f, "bg"); e.target.value = ""; }} />
                </label>
                {s.image && (
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => set("image", null)}
                    className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
                <ColorField id="bg-color" label="Background" value={s.bgColor}
                  onChange={(v) => set("bgColor", v)} />
                <div className="flex gap-1">
                  {(["cover", "contain"] as const).map((m) => (
                    <button key={m} type="button" aria-pressed={s.fit === m}
                      onClick={() => set("fit", m)}
                      className={cn("rounded-md px-2.5 py-1.5 text-xs font-medium capitalize",
                        s.fit === m ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700")}>
                      {m === "cover" ? "Crop to fill" : "Fit whole image"}
                    </button>
                  ))}
                </div>
              </div>
              {s.image && (
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <Range id="zoom" label="Zoom" min={1} max={3} step={0.05} value={s.zoom} onChange={(v) => set("zoom", v)} unit="×" />
                  <Range id="ox" label="Move ↔" min={-1} max={1} step={0.02} value={s.offsetX} onChange={(v) => set("offsetX", v)} />
                  <Range id="oy" label="Move ↕" min={-1} max={1} step={0.02} value={s.offsetY} onChange={(v) => set("offsetY", v)} />
                </div>
              )}
            </div>
          )}

          {panel === "adjust" && (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Range id="br" label="Brightness" min={30} max={170} value={s.brightness} onChange={(v) => set("brightness", v)} unit="%" />
              <Range id="ct" label="Contrast" min={30} max={170} value={s.contrast} onChange={(v) => set("contrast", v)} unit="%" />
              <Range id="sat" label="Saturation" min={0} max={200} value={s.saturation} onChange={(v) => set("saturation", v)} unit="%" />
              <Range id="sh" label="Sharpness" min={0} max={100} value={s.sharpen} onChange={(v) => set("sharpen", v)} unit="%" />
              <Range id="bl" label="Blur" min={0} max={20} value={s.blur} onChange={(v) => set("blur", v)} unit="px" />
              <Range id="ov" label="Dark overlay" min={0} max={80} value={s.overlay} onChange={(v) => set("overlay", v)} unit="%" />
            </div>
          )}

          {panel === "text" && text && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {s.texts.map((t, i) => (
                  <button key={t.id} type="button" onClick={() => setActiveText(t.id)}
                    className={cn("rounded-md px-2.5 py-1.5 text-xs font-medium",
                      t.id === text.id ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700")}>
                    Text {i + 1}
                  </button>
                ))}
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => {
                    const t = makeText({ y: 0.5 });
                    commit((p) => ({ ...p, texts: [...p.texts, t] }));
                    setActiveText(t.id);
                  }}
                  className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  + Add text
                </Button>
                {s.texts.length > 1 && (
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => {
                      commit((p) => ({ ...p, texts: p.texts.filter((t) => t.id !== text.id) }));
                      setActiveText(s.texts.find((t) => t.id !== text.id)?.id ?? "");
                    }}
                    className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
              <textarea aria-label="Text content" maxLength={120} value={text.text}
                onChange={(e) => updateText(text.id, { text: e.target.value })}
                className={cn(darkField, "h-16 py-2")} />
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Range id="ts" label="Size" min={32} max={200} value={text.size} onChange={(v) => updateText(text.id, { size: v })} unit="px" />
                <Range id="tx" label="Move ↔" min={0.05} max={0.95} step={0.01} value={text.x} onChange={(v) => updateText(text.id, { x: v })} />
                <Range id="ty" label="Move ↕" min={0.05} max={0.95} step={0.01} value={text.y} onChange={(v) => updateText(text.id, { y: v })} />
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                  Font
                  <select value={text.font} onChange={(e) => updateText(text.id, { font: e.target.value })}
                    className={cn(darkField, "w-auto")} aria-label="Font">
                    {TEXT_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
                <div className="flex gap-1" role="group" aria-label="Alignment">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button key={a} type="button" aria-pressed={text.align === a}
                      onClick={() => updateText(text.id, { align: a })}
                      className={cn("rounded-md px-2.5 py-1.5 text-xs font-medium capitalize",
                        text.align === a ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700")}>
                      {a}
                    </button>
                  ))}
                </div>
                <ColorField id="tc" label="Colour" value={text.color} onChange={(v) => updateText(text.id, { color: v })} />
                <Check label="Outline" checked={text.outline} onChange={(v) => updateText(text.id, { outline: v })} />
                {text.outline && (
                  <ColorField id="toc" label="Outline colour" value={text.outlineColor}
                    onChange={(v) => updateText(text.id, { outlineColor: v })} />
                )}
                <Check label="Shadow" checked={text.shadow} onChange={(v) => updateText(text.id, { shadow: v })} />
                <Check label="Highlight bar" checked={text.highlight} onChange={(v) => updateText(text.id, { highlight: v })} />
                {text.highlight && (
                  <ColorField id="thc" label="Bar colour" value={text.highlightColor}
                    onChange={(v) => updateText(text.id, { highlightColor: v })} />
                )}
              </div>
              <div>
                <label htmlFor="badge" className="mb-1 block text-xs font-medium text-zinc-300">
                  Corner badge <span className="text-zinc-500">(optional, e.g. NEW)</span>
                </label>
                <input id="badge" maxLength={16} value={s.badge}
                  onChange={(e) => set("badge", e.target.value)} className={cn(darkField, "w-48")} />
              </div>
            </div>
          )}

          {panel === "style" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(Object.keys(STYLE_PRESETS) as ThumbStyle[]).map((style) => (
                <button key={style} type="button" onClick={() => commit((p) => applyPreset(p, style))}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-3 text-left hover:border-orange-500">
                  <span className="block h-6 w-full rounded"
                    style={{ background: STYLE_PRESETS[style].bgColor }} />
                  <span className="mt-1.5 block text-xs font-semibold">{style}</span>
                </button>
              ))}
            </div>
          )}

          {panel === "ai" && (
            <div className="space-y-3">
              {ready && !user ? (
                <p className="text-xs text-zinc-400">
                  AI image generation needs an account.{" "}
                  <Link to="/auth" className="font-semibold text-orange-400 underline">Sign in</Link>
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-48 flex-1">
                      <label htmlFor="ai-prompt" className="mb-1 block text-xs font-medium text-zinc-300">
                        Describe your thumbnail
                      </label>
                      <input id="ai-prompt" required minLength={10} maxLength={1500} value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Epic gaming scene with fire effects…" className={darkField} />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                      Style
                      <select value={aiStyle} aria-label="AI style"
                        onChange={(e) => setAiStyle(e.target.value as typeof aiStyle)}
                        className={cn(darkField, "w-auto")}>
                        {THUMBNAIL_STYLES.map((st) => <option key={st}>{st}</option>)}
                      </select>
                    </label>
                    <Button type="button" size="sm" onClick={() => void generate()}
                      disabled={aiLoading || !user || allowance.data === 0 || !!allowance.error}
                      className="bg-violet-600 font-semibold text-white hover:bg-violet-700">
                      {aiLoading
                        ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                        : <Sparkles className="h-4 w-4" />}
                      {aiLoading ? "Generating…" : s.image ? "Regenerate" : "Generate"}
                    </Button>
                  </div>
                  <p role="status" className="text-xs text-zinc-500">
                    {allowance.data === undefined
                      ? allowance.error ? "Allowance unavailable" : "Checking allowance…"
                      : `${allowance.data} / 5 AI generations left today · resets 00:00 UTC`}
                  </p>
                </>
              )}
            </div>
          )}

          {panel === "logo" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-700">
                  <Stamp className="h-4 w-4" /> {s.logo ? "Replace logo" : "Upload logo"}
                  <input type="file" accept="image/*" className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickFile(f, "logo"); e.target.value = ""; }} />
                </label>
                {s.logo && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => set("logo", null)}
                    className="text-zinc-400 hover:bg-zinc-800 hover:text-white">
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
              {s.logo && (
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <Range id="ls" label="Size" min={0.05} max={0.5} step={0.01} value={s.logo.size}
                    onChange={(v) => commit((p) => ({ ...p, logo: p.logo ? { ...p.logo, size: v } : null }))} />
                  <Range id="lx" label="Move ↔" min={0.05} max={0.95} step={0.01} value={s.logo.x}
                    onChange={(v) => commit((p) => ({ ...p, logo: p.logo ? { ...p.logo, x: v } : null }))} />
                  <Range id="ly" label="Move ↕" min={0.05} max={0.95} step={0.01} value={s.logo.y}
                    onChange={(v) => commit((p) => ({ ...p, logo: p.logo ? { ...p.logo, y: v } : null }))} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="grid grid-cols-6 border-t border-zinc-800 bg-zinc-950">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-pressed={panel === id}
            onClick={() => setPanel((p) => (p === id ? null : id))}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors motion-reduce:transition-none",
              panel === id ? "bg-zinc-900 text-orange-400" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
            )}>
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
