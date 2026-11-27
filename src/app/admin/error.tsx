"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/admin/common/empty-state";
import { Button } from "@/components/ui/button";

/** Any admin page that fails to load shows this, with a retry button. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="This page could not be loaded"
      description="Check your connection and try again. If it keeps happening, tell the admin."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
