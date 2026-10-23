import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useAccount } from "./auth-provider";

/** Premium gate shown instead of AI tool controls until the user signs in. */
export function SignInPrompt({ toolName }: { toolName: string }) {
  const { user, ready } = useAccount();
  if (!ready) {
    return (
      <div className="card-surface grid place-items-center p-10" aria-busy="true">
        <p className="text-sm text-muted-foreground">Checking your account…</p>
      </div>
    );
  }
  if (user) return null;
  return (
    <div className="card-surface flex flex-col items-center gap-4 p-8 text-center shadow-soft sm:p-10">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-soft text-violet">
        <Lock className="h-7 w-7" aria-hidden />
      </span>
      <div>
        <h2 className="text-xl font-bold">Sign in to use {toolName}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          AI tools are available to registered creators. Create a free account or sign in to
          start generating.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="h-11 bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">
          <Link to="/auth">Sign in</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 px-6 font-semibold">
          <Link to="/auth">Create free account</Link>
        </Button>
      </div>
    </div>
  );
}
