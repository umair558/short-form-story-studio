import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { generateYoutube } from "@/lib/ai.functions";
import { CopyButton } from "./copy-button";
import { ErrorNote, FieldInput, SubmitButton, useAiCall } from "./ai-list-tool";
import { useAccount } from "./auth-provider";
import { SignInPrompt } from "./sign-in-prompt";

const STYLES = ["Educational", "Entertaining", "Story-driven", "Review", "Tutorial"] as const;
type Res = { titles: string[]; description: string; tags: string[] };

export function YoutubeTool() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [style, setStyle] = useState<string>(STYLES[0]);
  const [localError, setLocalError] = useState<string | null>(null);
  const call = useServerFn(generateYoutube);
  const { loading, error, data, run } = useAiCall<Res>();
  const { user } = useAccount();

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (topic.trim().length < 2) return setLocalError("Please describe your video (at least 2 characters).");
    setLocalError(null);
    run(() => call({ data: { topic, keywords, style: style as (typeof STYLES)[number] } }));
  }

  if (!user) return <SignInPrompt toolName="the YouTube Title & Description Generator" />;

  return (
    <div>
      <form onSubmit={submit} noValidate className="card-surface space-y-4 p-5 sm:p-6">
        <FieldInput f={{ name: "topic", label: "What is your video about?", type: "textarea", maxLength: 400, placeholder: "e.g. I tested 5 budget mechanical keyboards under $50 for a month" }} value={topic} onChange={setTopic} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="yt-kw" className="mb-1.5 block text-sm font-medium">Keywords <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input id="yt-kw" className="field" maxLength={200} placeholder="e.g. budget keyboard, typing test" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          </div>
          <FieldInput f={{ name: "style", label: "Video style", type: "select", options: STYLES }} value={style} onChange={setStyle} />
        </div>
        <SubmitButton loading={loading} label="Generate title & description" />
      </form>
      {(localError || error) && <ErrorNote message={(localError || error)!} />}
      {data && !error && (
        <section aria-labelledby="yt-res" className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="yt-res" className="text-lg font-semibold">Title options</h2>
            <button type="button" onClick={() => submit()} disabled={loading} className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60">
              <RefreshCw className="h-4 w-4" aria-hidden /> Regenerate
            </button>
          </div>
          <ul className="space-y-3">
            {data.titles.map((t, i) => (
              <li key={i} className="card-surface flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="break-words text-[15px] font-medium">{t}</p>
                  <p className={t.length > 70 ? "mt-1 text-xs text-warning-foreground" : "mt-1 text-xs text-muted-foreground"}>{t.length} characters{t.length > 70 ? " — may be cut off in search" : ""}</p>
                </div>
                <CopyButton text={t} />
              </li>
            ))}
          </ul>
          <div className="card-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <CopyButton text={data.description} />
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{data.description}</p>
          </div>
          {data.tags.length > 0 && (
            <div className="card-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Tags</h2>
                <CopyButton text={data.tags.join(", ")} />
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {data.tags.map((t) => <li key={t} className="rounded-full bg-primary-soft px-3 py-1 text-sm text-primary">{t}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}
      {!data && !error && !localError && !loading && <p className="mt-6 text-center text-sm text-muted-foreground">Your titles, description and tags will appear here.</p>}
    </div>
  );
}
