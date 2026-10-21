import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { generateWorkflow } from "@/lib/ai.functions";
import { PLATFORMS } from "@/lib/tools";
import { CopyButton } from "./copy-button";
import { ErrorNote, FieldInput, SubmitButton, useAiCall } from "./ai-list-tool";

type Pkg = { hook: string; caption: string; hashtags: string[]; thumbnailText: string };

export function WorkflowTool({ compact = false }: { compact?: boolean }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [localError, setLocalError] = useState<string | null>(null);
  const call = useServerFn(generateWorkflow);
  const { loading, error, data, run } = useAiCall<Pkg>();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 2) return setLocalError("Please enter a video topic (at least 2 characters).");
    setLocalError(null);
    run(() => call({ data: { topic, platform: platform as (typeof PLATFORMS)[number] } }));
  }

  const blocks = data
    ? [
        { label: "Hook", text: data.hook },
        { label: "Caption", text: data.caption },
        { label: "Hashtags", text: data.hashtags.join(" ") },
        { label: "Thumbnail text", text: data.thumbnailText },
      ]
    : [];
  const all = blocks.map((b) => `${b.label}:\n${b.text}`).join("\n\n");

  return (
    <div>
      <form onSubmit={submit} noValidate className="card-surface grid gap-4 p-5 sm:p-6 md:grid-cols-[1fr_200px_auto] md:items-end">
        <FieldInput f={{ name: "topic", label: "Video topic", type: "text", placeholder: "e.g. 3 budget meal-prep recipes for students" }} value={topic} onChange={setTopic} />
        <FieldInput f={{ name: "platform", label: "Platform", type: "select", options: PLATFORMS }} value={platform} onChange={setPlatform} />
        <SubmitButton loading={loading} label="Generate package" />
      </form>
      {(localError || error) && <ErrorNote message={(localError || error)!} />}
      {data && !error && (
        <section aria-labelledby="pkg-title" className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <h2 id="pkg-title" className={compact ? "text-base font-semibold" : "text-lg font-semibold"}>Your content package</h2>
            <CopyButton text={all} label="Copy all" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {blocks.map((b) => (
              <div key={b.label} className="card-surface flex flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">{b.label}</h3>
                  <CopyButton text={b.text} />
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
