import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-foreground" aria-label="CreatorKit Studio home">
      <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
        CK
      </span>
      <span>
        CreatorKit<span className="text-primary"> Studio</span>
      </span>
    </Link>
  );
}
