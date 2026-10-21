import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-display text-base font-extrabold tracking-tight text-foreground" aria-label="CreatorKit Studio home">
      <svg aria-hidden viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
        <rect width="32" height="32" rx="9" className="fill-primary" />
        <path d="M13 10.5v11l9-5.5z" className="fill-primary-foreground" />
        <circle cx="24.5" cy="7.5" r="3.5" className="fill-orange" />
      </svg>
      <span>
        CreatorKit<span className="text-primary"> Studio</span>
      </span>
    </Link>
  );
}
