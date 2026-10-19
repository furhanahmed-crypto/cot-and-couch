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
    <section className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg">
            Category template: {template.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Variant axes: {template.variants.join(" · ")}
          </p>
          {template.note ? (
            <p className="mt-1 text-xs text-muted-foreground">{template.note}</p>
          ) : null}
        </div>
        <Badge variant="secondary">Schema Phase C</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {template.required.map((name) => (
          <div key={name} className="space-y-1">
            <Label>
              {name} <span className="text-destructive">*</span>
            </Label>
            <Input disabled placeholder="Coming with DB mapping" />
          </div>
        ))}
        {template.optional.map((name) => (
          <div key={name} className="space-y-1">
            <Label>{name}</Label>
            <Input disabled placeholder="Optional · Phase C" />
          </div>
        ))}
      </div>
    </section>
  );
}
