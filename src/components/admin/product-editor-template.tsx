import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryProductTemplate } from "@/constants/admin-product-templates";

/** Shows category-specific fields; unbound fields are visual stubs until Phase C. */
export function ProductEditorTemplate({
  template,
}: {
  template: CategoryProductTemplate | undefined;
}) {
  if (!template) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
        No category template mapped yet for this product.
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-heading text-lg break-words">
            Category template: {template.name}
          </h2>
          <p className="text-sm text-muted-foreground break-words">
            Variant axes: {template.variants.join(" · ")}
          </p>
          {template.note ? (
            <p className="mt-1 text-xs text-muted-foreground break-words">
              {template.note}
            </p>
          ) : null}
        </div>
        <Badge variant="secondary" className="shrink-0">
          Schema Phase C
        </Badge>
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {template.required.map((name) => (
          <div key={name} className="min-w-0 space-y-1">
            <Label className="break-words">
              {name} <span className="text-destructive">*</span>
            </Label>
            <Input disabled placeholder="Coming with DB mapping" className="max-w-full" />
          </div>
        ))}
        {template.optional.map((name) => (
          <div key={name} className="min-w-0 space-y-1">
            <Label className="break-words">{name}</Label>
            <Input disabled placeholder="Optional · Phase C" className="max-w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
