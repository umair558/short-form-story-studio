import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Hash, Captions, Type, Zap } from "lucide-react";
import { generateWorkflow } from "@/lib/ai.functions";
import { CONTENT_TYPES, PLATFORMS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { ErrorNote, FieldInput, SubmitButton, useAiCall } from "./ai-list-tool";
import { useAccount } from "./auth-provider";
import { SignInPrompt } from "./sign-in-prompt";

type Pkg = { hook: string; caption: string; hashtags: string[]; thumbnailText: string };

const SLOTS = [
  { key: "hook", label: "Hook", icon: Zap, tint: "bg-orange-soft text-orange-ink" },
  { key: "caption", label: "Caption", icon: Captions, tint: "bg-primary-soft text-primary" },
  { key: "hashtags", label: "Hashtags", icon: Hash, tint: "bg-violet-soft text-violet" },
  { key: "thumb", label: "Thumbnail text", icon: Type, tint: "bg-teal-soft text-teal" },
] as const;

export function WorkflowTool({ compact = false }: { compact?: boolean }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [contentType, setContentType] = useState<string>(CONTENT_TYPES[0]);
  const [localError, setLocalError] = useState<string | null>(null);
  const call = useServerFn(generateWorkflow);
  const { loading, error, data, run } = useAiCall<Pkg>();
  const { user } = useAccount();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 2) return setLocalError("Please enter a video topic (at least 2 characters).");
    setLocalError(null);
    run(() =>
      call({
        data: {
          topic,
          platform: platform as (typeof PLATFORMS)[number],
          contentType: contentType as (typeof CONTENT_TYPES)[number],
        },
      }),
    );
  }

  const texts: Record<(typeof SLOTS)[number]["key"], string> | null = data
    ? { hook: data.hook, caption: data.caption, hashtags: data.hashtags.join(" "), thumb: data.thumbnailText }
    : null;
  const all = texts ? SLOTS.map((s) => `${s.label}:\n${texts[s.key]}`).join("\n\n") : "";

  if (!user) return <SignInPrompt toolName="Creator Workflow" />;

  return (
    <div>
      <form onSubmit={submit} noValidate className="card-surface grid gap-4 p-5 shadow-soft sm:p-6 md:grid-cols-[1fr_220px]">
        <FieldInput f={{ name: "topic", label: "Video topic", type: "text", placeholder: "e.g. 3 budget meal-prep recipes for students" }} value={topic} onChange={setTopic} />
        <FieldInput f={{ name: "contentType", label: "Content type", type: "select", options: CONTENT_TYPES }} value={contentType} onChange={setContentType} />
        <FieldInput f={{ name: "platform", label: "Platform", type: "select", options: PLATFORMS }} value={platform} onChange={setPlatform} />
        <div className="md:col-span-full">
          <SubmitButton loading={loading} label="Generate Content Package" />
        </div>
      </form>
      {(localError || error) && <ErrorNote message={(localError || error)!} />}

      <section aria-labelledby="pkg-title" className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h2 id="pkg-title" className={compact ? "text-base font-semibold" : "text-lg font-semibold"}>
            {texts ? "Your content package" : "Your package will include"}
          </h2>
          {texts && <CopyButton text={all} label="Copy all" />}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SLOTS.map((s) => (
            <div key={s.key} className={cn("card-surface flex min-w-0 flex-col p-4", !texts && "border-dashed")}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                  <span className={cn("grid h-7 w-7 place-items-center rounded-md", s.tint)}><s.icon className="h-3.5 w-3.5" aria-hidden /></span>
                  {s.label}
                </h3>
                {texts && <CopyButton text={texts[s.key]} />}
              </div>
              {texts ? (
                <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{texts[s.key]}</p>
              ) : (
                <div aria-hidden className={cn("mt-3 space-y-2", loading && "animate-pulse")}>
                  <div className="h-2.5 w-full rounded bg-muted" />
                  <div className="h-2.5 w-2/3 rounded bg-muted" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
