"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ListEditorProps<T> = {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  addLabel: string;
  renderItem: (item: T, update: (next: T) => void, position: number) => ReactNode;
};

function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Rows you can add, remove and move up / down (images, specs). Order is saved as shown. */
export function ListEditor<T>({ items, onChange, newItem, addLabel, renderItem }: ListEditorProps<T>) {
  return (
    <div className="space-y-3">
      {items.map((item, position) => (
        <div key={position} className="flex items-start gap-2 rounded-lg bg-card p-3 ring-1 ring-border/60">
          <div className="min-w-0 flex-1">
            {renderItem(item, (next) => onChange(items.map((current, index) => (index === position ? next : current))), position)}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Move up" disabled={position === 0} onClick={() => onChange(move(items, position, position - 1))}>
              <ArrowUp className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Move down" disabled={position === items.length - 1} onClick={() => onChange(move(items, position, position + 1))}>
              <ArrowDown className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => onChange(items.filter((_, index) => index !== position))}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...items, newItem()])}>
        <Plus className="size-4" /> {addLabel}
      </Button>
    </div>
  );
}
