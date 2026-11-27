"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type SaveBarProps = {
  isDirty: boolean;
  isPending: boolean;
  onSave: () => void;
  onReset?: () => void;
  saveLabel?: string;
};

/**
 * Sticky bar at the bottom of an editor. Shows only with unsaved changes and
 * makes the browser warn before the tab is closed or reloaded.
 */
export function SaveBar({ isDirty, isPending, onSave, onReset, saveLabel = "Save changes" }: SaveBarProps) {
  useEffect(() => {
    if (!isDirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  if (!isDirty && !isPending) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <p className="mr-auto text-sm text-muted-foreground">Unsaved changes</p>
      {onReset ? (
        <Button type="button" variant="ghost" disabled={isPending} onClick={onReset}>
          Discard
        </Button>
      ) : null}
      <Button type="button" disabled={isPending} onClick={onSave}>
        {isPending ? "Saving…" : saveLabel}
      </Button>
    </div>
  );
}
