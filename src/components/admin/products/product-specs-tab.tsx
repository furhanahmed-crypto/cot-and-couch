"use client";

import { useState } from "react";
import { saveProductSpecsAction } from "@/app/admin/products/content-actions";
import { SaveBar } from "@/components/admin/common/save-bar";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { ListEditor } from "./list-editor";

type SpecRow = { label: string; value: string };

/** Label / value facts shown on the product page, e.g. Comfort: Firm. Mattress specs also drive shop filters. */
export function ProductSpecsTab({ productId, specs }: { productId: string; specs: SpecRow[] }) {
  const [saved, setSaved] = useState(specs);
  const [rows, setRows] = useState(specs);
  const { run, isPending } = useActionToast();
  const isDirty = JSON.stringify(rows) !== JSON.stringify(saved);

  function save() {
    run(
      () => saveProductSpecsAction({ productId, specs: rows }),
      { loading: "Saving specs…", success: "Specs saved", error: "Could not save the specs" },
      () => setSaved(rows),
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-muted-foreground">Only facts from the client. Each label once.</p>
      <ListEditor
        items={rows}
        onChange={setRows}
        newItem={() => ({ label: "", value: "" })}
        addLabel="Add spec"
        renderItem={(row, update, position) => (
          <div className="grid gap-2 sm:grid-cols-[12rem_1fr]">
            <Input aria-label={`Spec ${position + 1} label`} placeholder="Label, e.g. Comfort" value={row.label} onChange={(event) => update({ ...row, label: event.target.value })} />
            <Input aria-label={`Spec ${position + 1} value`} placeholder="Value, e.g. Firm" value={row.value} onChange={(event) => update({ ...row, value: event.target.value })} />
          </div>
        )}
      />
      <SaveBar isDirty={isDirty} isPending={isPending} onSave={save} onReset={() => setRows(saved)} saveLabel="Save specs" />
    </div>
  );
}
