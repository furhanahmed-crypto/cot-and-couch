import { FlaskConical } from "lucide-react";

export function MockBanner({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "rounded-lg border border-brass/40 bg-brass/10 px-3 py-2 text-xs text-muted-foreground"
          : "rounded-xl border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-muted-foreground"
      }
    >
      <p className="flex items-center gap-2 font-medium text-ink">
        <FlaskConical className="size-4 shrink-0 text-brass" aria-hidden />
        Mock prototype — in-memory only
      </p>
      {!compact && (
        <p className="mt-1 pl-6">
          No real APIs or server persistence. Staff auth is mocked in local storage.
        </p>
      )}
    </div>
  );
}
