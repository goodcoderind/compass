import { cn } from "@/lib/utils";

export function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-border"
      />
      <path
        d="M16 6v4M16 22v4M6 16h4M22 16h4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        className="text-muted"
      />
      <path
        d="M16 12l2.5 4-2.5 2-2.5-2 2.5-4z"
        fill="currentColor"
        className="text-accent"
      />
      <circle cx="16" cy="16" r="2" fill="currentColor" className="text-accent-secondary" />
    </svg>
  );
}
