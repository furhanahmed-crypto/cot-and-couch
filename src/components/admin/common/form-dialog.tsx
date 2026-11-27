"use client";

import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: () => void;
  /** FormField components. */
  children: ReactNode;
};

/** Dialog with a form: fields, Cancel and one Save button. Enter submits. */
export function FormDialog(props: FormDialogProps) {
  function submit(event: FormEvent) {
    event.preventDefault();
    props.onSubmit();
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            {props.description ? <DialogDescription>{props.description}</DialogDescription> : null}
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-1">{props.children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={props.isPending} onClick={() => props.onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={props.isPending}>
              {props.isPending ? "Saving…" : props.submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
