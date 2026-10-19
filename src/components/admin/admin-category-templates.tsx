"use client";

import {
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createBrandGroupOptionAction,
  createMattressBrandAction,
  deleteMattressBrandAction,
  updateMattressBrandAction,
} from "@/app/admin/categories/actions";
import {
  renameCategoryAction,
  setCategoryActiveAction,
} from "@/app/admin/catalogue/actions";
import { AppSelect } from "@/components/ui/app-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { templateForCategorySlug } from "@/constants/admin-product-templates";
import type {
  AdminMattressBrand,
  AdminOption,
  CategoryTemplatesData,
} from "@/services/admin-categories";
import { cn } from "@/lib/utils";

const GROUP_META: {
  key: keyof CategoryTemplatesData["optionsByGroup"];
  title: string;
  hint: string;
}[] = [
  {
    key: "purpose",
    title: "Mattress types",
    hint: "e.g. Sleeping, Pain relief, Cooling",
  },
  {
    key: "comfort",
    title: "Firmness",
    hint: "e.g. Soft, Medium, Firm",
  },
  {
    key: "filling",
    title: "Layer construction",
    hint: "e.g. Coir, Polyfoam, Feather",
  },
  {
    key: "cover_material",
    title: "Cover fabric",
    hint: "e.g. Cotton, Polyester",
  },
];

export function AdminCategoryTemplates({ data }: { data: CategoryTemplatesData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [brandName, setBrandName] = useState("");
  const [editing, setEditing] = useState<AdminMattressBrand | null>(null);

  const mattressCategory = data.categories.find((c) => c.slug === "mattresses");
  const otherCategories = data.categories.filter((c) => c.slug !== "mattresses");

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {mattressCategory ? (
        <CategorySection
          title={mattressCategory.name}
          slug={mattressCategory.slug}
          visible={mattressCategory.visible}
          pending={pending}
          onRename={(name) => {
            startTransition(async () => {
              await renameCategoryAction({
                categoryId: mattressCategory.id,
                name,
              });
              refresh();
            });
          }}
          onToggleVisible={() => {
            startTransition(async () => {
              await setCategoryActiveAction({
                categoryId: mattressCategory.id,
                isActive: !mattressCategory.visible,
              });
              refresh();
            });
          }}
        >
          <p className="text-sm text-muted-foreground">
            Mattress brands and the types / firmness / layers / covers each brand
            offers. Edit a brand to manage its catalogue options.
          </p>

          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const res = await createMattressBrandAction({ name: brandName });
                if (!res.ok) toast.error(res.error);
                else {
                  toast.success("Brand added");
                  setBrandName("");
                  refresh();
                }
              });
            }}
          >
            <div className="min-w-[12rem] flex-1 space-y-1">
              <Label htmlFor="new-brand">Add brand</Label>
              <Input
                id="new-brand"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Wake Fit"
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              <Plus className="size-3.5" />
              Add brand
            </Button>
          </form>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {data.brands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border/80 bg-background px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {brand.optionIds.length} options linked
                    {!brand.isActive ? " · inactive" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => setEditing(brand)}
                    aria-label={`Edit ${brand.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    disabled={pending}
                    className="text-destructive"
                    onClick={() => {
                      startTransition(async () => {
                        const res = await deleteMattressBrandAction(brand.id);
                        if (!res.ok) toast.error(res.error);
                        else {
                          toast.success("Brand removed");
                          refresh();
                        }
                      });
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CategorySection>
      ) : null}

      {otherCategories.map((cat) => {
        const template = templateForCategorySlug(cat.slug);
        return (
          <CategorySection
            key={cat.id}
            title={cat.name}
            slug={cat.slug}
            visible={cat.visible}
            pending={pending}
            onRename={(name) => {
              startTransition(async () => {
                await renameCategoryAction({ categoryId: cat.id, name });
                refresh();
              });
            }}
            onToggleVisible={() => {
              startTransition(async () => {
                await setCategoryActiveAction({
                  categoryId: cat.id,
                  isActive: !cat.visible,
                });
                refresh();
              });
            }}
          >
            <p className="text-sm text-muted-foreground">
              Variant axes: {template?.variants.join(" · ") ?? "—"}
            </p>
            {template ? (
              <div className="flex flex-wrap gap-1.5">
                {template.required.map((f) => (
                  <Badge key={f} variant="secondary" className="font-normal">
                    {f}
                  </Badge>
                ))}
                {template.optional.map((f) => (
                  <Badge key={f} variant="outline" className="font-normal">
                    {f}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No template mapped.</p>
            )}
            <p className="text-xs text-muted-foreground">
              Spec values are edited per product. Masters (colours, sizes) live
              under Masters.
            </p>
          </CategorySection>
        );
      })}

      <BrandEditorSheet
        open={Boolean(editing)}
        brand={editing}
        optionsByGroup={data.optionsByGroup}
        pending={pending}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSave={(payload) => {
          startTransition(async () => {
            const res = await updateMattressBrandAction(payload);
            if (!res.ok) toast.error(res.error);
            else {
              toast.success("Brand saved");
              setEditing(null);
              refresh();
            }
          });
        }}
        onAddOption={(groupKey, label) => {
          if (!editing) return;
          startTransition(async () => {
            const res = await createBrandGroupOptionAction({
              brandId: editing.id,
              groupKey,
              label,
            });
            if (!res.ok) toast.error(res.error);
            else {
              toast.success("Option added");
              refresh();
              setEditing((prev) =>
                prev && res.ok
                  ? {
                      ...prev,
                      optionIds: [...new Set([...prev.optionIds, res.optionId])],
                    }
                  : prev,
              );
            }
          });
        }}
      />
    </div>
  );
}

function CategorySection({
  title,
  slug,
  visible,
  pending,
  onRename,
  onToggleVisible,
  children,
}: {
  title: string;
  slug: string;
  visible: boolean;
  pending: boolean;
  onRename: (name: string) => void;
  onToggleVisible: () => void;
  children: ReactNode;
}) {
  const [name, setName] = useState(title);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim() && name.trim() !== title) onRename(name.trim());
              }}
              className="max-w-xs font-heading text-lg font-medium"
            />
            <Badge variant="outline">{slug}</Badge>
            {!visible ? <Badge variant="secondary">Hidden</Badge> : null}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={onToggleVisible}
        >
          {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          {visible ? "Visible" : "Hidden"}
        </Button>
      </div>
      {children}
    </section>
  );
}

function BrandEditorSheet({
  open,
  brand,
  optionsByGroup,
  pending,
  onOpenChange,
  onSave,
  onAddOption,
}: {
  open: boolean;
  brand: AdminMattressBrand | null;
  optionsByGroup: CategoryTemplatesData["optionsByGroup"];
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: {
    id: string;
    name: string;
    isActive: boolean;
    defaults: Record<string, string>;
    optionIds: string[];
  }) => void;
  onAddOption: (
    groupKey: keyof CategoryTemplatesData["optionsByGroup"],
    label: string,
  ) => void;
}) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [newLabels, setNewLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!brand) return;
    setName(brand.name);
    setIsActive(brand.isActive);
    setSelected(new Set(brand.optionIds));
    setDefaults({
      warrantyYears: brand.defaults.warrantyYears ?? "5",
      removableCover: brand.defaults.removableCover ?? "",
      flippable: brand.defaults.flippable ?? "",
      trialNights: brand.defaults.trialNights ?? "",
      idealFor: brand.defaults.idealFor ?? "",
    });
    setNewLabels({});
  }, [brand]);

  function toggleOption(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const yesNo = [
    { value: "unset", label: "Select…" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>{brand?.name ?? "Brand"} mattress options</SheetTitle>
          <SheetDescription>
            Choose which mattress types, firmness, layers, and covers this brand
            offers. Add new values when needed.
          </SheetDescription>
        </SheetHeader>

        {brand ? (
          <div className="space-y-5 px-4 pb-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>Brand name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(v) => setIsActive(v === true)}
                  id="brand-active"
                />
                <Label htmlFor="brand-active">Active brand</Label>
              </div>
            </div>

            {GROUP_META.map((group) => (
              <OptionGroupEditor
                key={group.key}
                title={group.title}
                hint={group.hint}
                options={optionsByGroup[group.key]}
                selected={selected}
                onToggle={toggleOption}
                newLabel={newLabels[group.key] ?? ""}
                onNewLabelChange={(v) =>
                  setNewLabels((prev) => ({ ...prev, [group.key]: v }))
                }
                onAdd={() => {
                  const label = (newLabels[group.key] ?? "").trim();
                  if (!label) return;
                  onAddOption(group.key, label);
                  setNewLabels((prev) => ({ ...prev, [group.key]: "" }));
                }}
                pending={pending}
              />
            ))}

            <div className="space-y-3 rounded-lg border border-border/70 p-3">
              <p className="text-sm font-medium">Brand defaults</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Brand warranty (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={defaults.warrantyYears ?? ""}
                    onChange={(e) =>
                      setDefaults((d) => ({
                        ...d,
                        warrantyYears: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Trial period (nights)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={defaults.trialNights ?? ""}
                    onChange={(e) =>
                      setDefaults((d) => ({
                        ...d,
                        trialNights: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Removable cover</Label>
                  <AppSelect
                    value={defaults.removableCover || "unset"}
                    onValueChange={(v) =>
                      setDefaults((d) => ({
                        ...d,
                        removableCover: v === "unset" ? "" : v,
                      }))
                    }
                    items={yesNo}
                    placeholder="Select…"
                    triggerClassName="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Flippable</Label>
                  <AppSelect
                    value={defaults.flippable || "unset"}
                    onValueChange={(v) =>
                      setDefaults((d) => ({
                        ...d,
                        flippable: v === "unset" ? "" : v,
                      }))
                    }
                    items={yesNo}
                    placeholder="Select…"
                    triggerClassName="w-full"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Ideal for</Label>
                  <Input
                    value={defaults.idealFor ?? ""}
                    onChange={(e) =>
                      setDefaults((d) => ({ ...d, idealFor: e.target.value }))
                    }
                    placeholder="e.g. Side sleepers, couples"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending || !brand}
            onClick={() => {
              if (!brand) return;
              onSave({
                id: brand.id,
                name,
                isActive,
                defaults,
                optionIds: [...selected],
              });
            }}
          >
            {pending ? "Saving…" : "Save brand"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function OptionGroupEditor({
  title,
  hint,
  options,
  selected,
  onToggle,
  newLabel,
  onNewLabelChange,
  onAdd,
  pending,
}: {
  title: string;
  hint: string;
  options: AdminOption[];
  selected: Set<string>;
  onToggle: (id: string, on: boolean) => void;
  newLabel: string;
  onNewLabelChange: (v: string) => void;
  onAdd: () => void;
  pending: boolean;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border/70 p-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onToggle(o.id, !on)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
                !o.isActive && "opacity-50",
              )}
            >
              {o.label}
            </button>
          );
        })}
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground">No options yet.</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          value={newLabel}
          onChange={(e) => onNewLabelChange(e.target.value)}
          placeholder={`Add ${title.toLowerCase()}…`}
          className="min-w-[10rem] flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || !newLabel.trim()}
          onClick={onAdd}
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}
