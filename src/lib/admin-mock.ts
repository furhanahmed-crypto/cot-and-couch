import { toast } from "sonner";

export function mockToast(detail?: string) {
  toast.message("Mock — not persisted", {
    description: detail ?? "Changes exist in memory only for this session.",
  });
}
