import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Badge tones from the brand palette only (espresso, terracotta, sand, red).
 * Which status gets which tone lives in constants/ next to the status list.
 */
type BadgeTone = "neutral" | "outline" | "accent" | "strong" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  outline: "border-border bg-transparent text-foreground",
  accent: "bg-brass/15 text-ink dark:text-foreground",
  strong: "bg-primary text-primary-foreground",
  danger: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return <Badge className={cn("font-medium", TONE_CLASSES[tone])}>{label}</Badge>;
}
