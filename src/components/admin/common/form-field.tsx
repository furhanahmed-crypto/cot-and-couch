import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  /** Matches the input's id, so clicking the label focuses it. */
  id: string;
  label: string;
  help?: string;
  error?: string;
  /** The input itself. Give it `id={id}` and `aria-invalid={Boolean(error)}`. */
  children: ReactNode;
};

/** Label, input, help text and error text, always in the same order and spacing. */
export function FormField({ id, label, help, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {help && !error ? <p className="text-xs text-muted-foreground">{help}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
