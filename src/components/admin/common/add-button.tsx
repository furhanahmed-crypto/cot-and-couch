"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type AddButtonProps = {
  label: string;
  /** The dialog to open, given its open state. */
  renderDialog: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;
  variant?: "default" | "outline";
};

/** The page's primary "Add …" button and the dialog it opens. */
export function AddButton({ label, renderDialog, variant = "default" }: AddButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant={variant} onClick={() => setOpen(true)}>
        <Plus className="size-4" /> {label}
      </Button>
      {renderDialog(open, setOpen)}
    </>
  );
}
