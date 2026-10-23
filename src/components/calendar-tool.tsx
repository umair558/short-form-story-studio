import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { Download } from "lucide-react";
import { generateCalendar, type CalendarDay } from "@/lib/ai.functions";
import { calendarToCsv, dateForDay } from "@/lib/calendar";
import { downloadBlob } from "@/lib/image";
import { PLATFORMS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { ErrorNote, FieldInput, SubmitButton, useAiCall } from "./ai-list-tool";
import { useAccount } from "./auth-provider";
import { SignInPrompt } from "./sign-in-prompt";

const GOALS = ["Grow followers", "Build engagement", "Sell a product", "Build authority"] as const;
const LENGTHS = [7, 14, 30] as const;

export function CalendarTool() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [goal, setGoal] = useState<string>(GOALS[0]);
  const [days, setDays] = useState<(typeof LENGTHS)[number]>(7);
  const [start, setStart] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const call = useServerFn(generateCalendar);
  const { loading, error, data, run } = useAiCall<{ days: CalendarDay[] }>();
  const { user } = useAccount();

  useEffect(() => setStart(new Date().toISOString().slice(0, 10)), []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (niche.trim().length < 2) return setLocalError("Please enter your niche (at least 2 characters).");
    setLocalError(null);
    run(() => call({ data: { niche, platform: platform as (typeof PLATFORMS)[number], goal: goal as (typeof GOALS)[number], days } }));
  }

  const startDate = start || new Date().toISOString().slice(0, 10);
  const text = data ? data.days.map((d) => `Day ${d.day} (${dateForDay(startDate, d.day)}) — ${d.theme} · ${d.format}\n${d.idea}\nHook: ${d.hook}`).join("\n\n") : "";

  if (!user) return <SignInPrompt toolName="the Content Calendar" />;

  return (
    <div>
      <form onSubmit={submit} noValidate className="card-surface space-y-4 p-5 sm:p-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Plan length</legend>
          <div className="grid grid-cols-3 gap-2">
            {LENGTHS.map((n) => (
              <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)} className={cn("h-11 rounded-md border text-sm font-semibold", days === n ? "border-orange bg-orange text-orange-foreground" : "hover:bg-muted")}>
                {n} days
              </button>
            ))}
          </div>
        </fieldset>
        <FieldInput f={{ name: "niche", label: "Your niche", type: "text", maxLength: 200, placeholder: "e.g. home workouts for busy parents" }} value={niche} onChange={setNiche} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput f={{ name: "goal", label: "Main goal", type: "select", options: GOALS }} value={goal} onChange={setGoal} />
          <div>
            <label htmlFor="cal-start" className="mb-1.5 block text-sm font-medium">Start date</label>
            <input id="cal-start" type="date" className="field" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
        </div>
        <FieldInput f={{ name: "platform", label: "Platform", type: "select", options: PLATFORMS }} value={platform} onChange={setPlatform} />
        <SubmitButton loading={loading} label={`Plan ${days} days`} />
        {loading && days === 30 && <p className="text-sm text-muted-foreground">A 30-day plan can take up to a minute.</p>}
      </form>
      {(localError || error) && <ErrorNote message={(localError || error)!} />}
      {data && !error && (
        <section aria-labelledby="cal-res" className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="cal-res" className="text-lg font-semibold">Your {data.days.length}-day calendar</h2>
            <div className="flex gap-2">
              <CopyButton text={text} label="Copy all" />
              <button type="button" onClick={() => downloadBlob(new Blob([calendarToCsv(data.days, startDate)], { type: "text/csv;charset=utf-8" }), `content-calendar-${data.days.length}-days.csv`)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <Download className="h-4 w-4" aria-hidden /> CSV
              </button>
            </div>
          </div>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.days.map((d) => (
              <li key={d.day} className="card-surface min-w-0 p-4">
                <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide">
                  <span className="text-primary">Day {d.day} · {new Date(`${dateForDay(startDate, d.day)}T12:00:00Z`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span className="rounded-full bg-orange-soft px-2 py-0.5 text-orange-ink">{d.theme}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{d.format}</p>
                <p className="mt-1 break-words text-[15px] leading-relaxed">{d.idea}</p>
                <p className="mt-2 break-words text-sm"><strong>Hook:</strong> {d.hook}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      {!data && !error && !localError && !loading && <p className="mt-6 text-center text-sm text-muted-foreground">Your day-by-day plan will appear here.</p>}
    </div>
  );
}
