import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { DASHBOARD_RANGES, type DashboardRange } from "@/types/dashboard";

const RANGE_LABELS: Record<DashboardRange, string> = { "7d": "Last 7 days", "30d": "Last 30 days" };

/** Two links that set `?range=`. Plain links, so it works without JavaScript. */
export function RangeSwitch({ current }: { current: DashboardRange }) {
  return (
    <nav aria-label="Date range" className="inline-flex rounded-lg bg-muted p-1">
      {DASHBOARD_RANGES.map((range) => (
        <Link
          key={range}
          href={range === "7d" ? ROUTES.admin.root : `${ROUTES.admin.root}?range=${range}`}
          aria-current={range === current ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition",
            range === current ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {RANGE_LABELS[range]}
        </Link>
      ))}
    </nav>
  );
}
