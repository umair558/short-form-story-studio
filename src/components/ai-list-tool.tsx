import { PlatformPicker } from "./platform-picker";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { generateList, type ListInput } from "@/lib/ai.functions";
import { CopyButton } from "./copy-button";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: readonly string[];
  maxLength?: number;
}

export function useAiCall<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  async function run(fn: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      if (res.ok) setData(res.data);
      else setError(res.error);
    } catch (e) {
      const msg = e instanceof Error && e.message.includes("2 characters") ? "Please fill in every field with at least 2 characters." : "We couldn't reach the AI service. Check your connection and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }
  return { loading, error, data, run };
}

export function FieldInput({ f, value, onChange }: { f: FieldDef; value: string; onChange: (v: string) => void }) {
  const id = `f-${f.name}`;
  if (f.type === "select" && f.name === "platform") {
    return (
      <div className="md:col-span-full">
        <p id={id} className="mb-1.5 block text-sm font-medium">{f.label}</p>
        <PlatformPicker id={id} label={f.label} options={f.options!} value={value} onChange={onChange} />
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{f.label}</label>
      {f.type === "select" ? (
        <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
          {f.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : f.type === "textarea" ? (
        <textarea id={id} className="field min-h-24" required minLength={2} maxLength={f.maxLength ?? 300} placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} className="field" required minLength={2} maxLength={f.maxLength ?? 300} placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="mt-6 flex items-start gap-3 rounded-lg border bg-warning-soft p-4 text-sm text-warning-foreground">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{message}</p>
    </div>
  );
}

export function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 sm:w-auto">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
      {loading ? "Generating…" : label}
    </button>
  );
}

export function AiListTool({
  tool,
  fields,
  submitLabel,
  resultTitle,
  copyAllSeparator = "\n\n",
}: {
  tool: ListInput["tool"];
  fields: FieldDef[];
  submitLabel: string;
  resultTitle: string;
  copyAllSeparator?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.type === "select" ? (f.options![0] ?? "") : ""])),
  );
  const call = useServerFn(generateList);
  const { loading, error, data, run } = useAiCall<{ items: string[] }>();
  const [localError, setLocalError] = useState<string | null>(null);
  const { user } = useAccount();

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const empty = fields.find((f) => f.type !== "select" && (values[f.name] ?? "").trim().length < 2);
    if (empty) return setLocalError(`Please enter a ${empty.label.toLowerCase()} (at least 2 characters).`);
    setLocalError(null);
    run(() => call({ data: { tool, ...values } as ListInput }));
  }

  if (!user) return <SignInPrompt toolName={resultTitle} />;

  return (
    <div>
      <form onSubmit={submit} noValidate className="card-surface space-y-4 p-5 sm:p-6">
        {fields.map((f) => (
          <FieldInput key={f.name} f={f} value={values[f.name] ?? ""} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
        ))}
        <SubmitButton loading={loading} label={submitLabel} />
      </form>
      {(localError || error) && <ErrorNote message={(localError || error)!} />}
      {data && !error && (
        <section aria-labelledby="results-title" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="results-title" className="text-lg font-semibold">{resultTitle}</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => submit()} disabled={loading} className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60">
                <RefreshCw className="h-4 w-4" aria-hidden /> Regenerate
              </button>
              <CopyButton text={data.items.join(copyAllSeparator)} label="Copy all" />
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {data.items.map((item, i) => (
              <li key={i} className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{item}</p>
                <CopyButton text={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {!data && !error && !localError && !loading && (
        <p className="mt-6 text-center text-sm text-muted-foreground">Your AI suggestions will appear here.</p>
      )}
    </div>
  );
}
