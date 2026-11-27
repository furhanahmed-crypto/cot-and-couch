import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  /** Where to see the rows behind the number. */
  href: string;
};

export function StatCard({ label, value, hint, icon: Icon, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group space-y-2 rounded-xl bg-card p-4 ring-1 ring-border/60 transition hover:ring-brass/60"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-brass" />
      </div>
      <p className="font-heading text-3xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}
