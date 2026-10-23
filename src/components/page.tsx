import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { AdSlot } from "./ad-slot";
import { Button } from "./ui/button";

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
      {intro && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</p>
      )}
    </div>
  );
}

export function ToolPage({
  title,
  intro,
  privacy,
  children,
  guide,
  faq,
}: {
  title: string;
  intro: string;
  privacy: string;
  children: ReactNode;
  guide: ReactNode;
  faq?: { q: string; a: string }[];
}) {
  const router = useRouter();
  const navigate = useNavigate();
  return (
    <main>
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-3xl px-4 pt-6 text-sm text-muted-foreground sm:px-6"
      >
        <Button
          variant="ghost"
          size="icon"
          title="Back"
          aria-label="Back to previous page"
          className="mr-3"
          onClick={() => {
            if (router.history.canGoBack()) router.history.back();
            else void navigate({ to: "/tools" });
          }}
        >
          <ArrowLeft />
        </Button>
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        <span aria-hidden>/</span>{" "}
        <Link to="/tools" className="hover:text-foreground">
          Tools
        </Link>{" "}
        <span aria-hidden>/</span> <span className="text-foreground">{title}</span>
      </nav>
      <PageHeader title={title} intro={intro} />
      <section className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">{children}</section>
      <p className="mx-auto mt-4 flex max-w-3xl items-start gap-2 px-4 text-sm text-muted-foreground sm:px-6">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
        <span>{privacy}</span>
      </p>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <AdSlot id="tool-below" />
      </div>
      <article className="prose-guide mx-auto mt-12 max-w-3xl space-y-4 px-4 text-base leading-relaxed text-muted-foreground sm:px-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
        {guide}
        {faq && faq.length > 0 && (
          <>
            <h2>Frequently asked questions</h2>
            <dl className="space-y-4">
              {faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-foreground">{f.q}</dt>
                  <dd className="mt-1">{f.a}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </article>
    </main>
  );
}

export const AI_PRIVACY =
  "Your text is sent securely to our AI provider only to generate suggestions. We don't store it or attach it to an account.";
export const IMAGE_PRIVACY =
  "Images are processed entirely in your browser. They are never uploaded to our servers.";
