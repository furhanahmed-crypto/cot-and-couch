import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  /** e.g. a small button on the right of the title. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** A titled card on detail pages (order detail, …). */
export function SectionCard({ title, action, className, children }: SectionCardProps) {
  return (
    <section className={cn("space-y-4 rounded-xl bg-card p-4 ring-1 ring-border/60", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
