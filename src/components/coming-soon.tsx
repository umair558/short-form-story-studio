import { LockKeyhole, WandSparkles, Mic, Video } from "lucide-react";
export function ComingSoon() {
  return (
    <section className="mt-10" aria-labelledby="coming-soon">
      <div className="mb-5 flex items-center gap-3">
        <h2 id="coming-soon" className="text-xl font-bold">
          Next in your studio
        </h2>
        <span className="text-xs font-semibold text-violet">Coming Soon</span>
      </div>
      <div className="tool-row sm:grid-cols-3">
        {[
          { name: "AI Video Studio", icon: Video },
          { name: "Voiceover Studio", icon: Mic },
          { name: "Background Remover", icon: WandSparkles },
        ].map((t) => (
          <div
            key={t.name}
            className="relative min-h-44 overflow-hidden rounded-lg border bg-card p-5"
            aria-disabled="true"
          >
            <div className="absolute right-6 top-5 text-violet/30 blur-sm" aria-hidden>
              <t.icon size={56} />
            </div>
            <LockKeyhole className="text-muted-foreground" size={20} />
            <h3 className="relative mt-6 font-semibold">{t.name}</h3>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">Coming Soon</p>
          </div>
        ))}
      </div>
    </section>
  );
}
