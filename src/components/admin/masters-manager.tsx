"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createBrandAction,
  createCollectionAction,
  createColourAction,
  createSizeAction,
  deleteBrandAction,
  deleteCollectionAction,
  deleteColourAction,
  deleteSizeAction,
  updateBrandAction,
  updateCollectionAction,
  updateColourAction,
  updateSizeAction,
} from "@/app/admin/masters/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Brand, Collection, Colour, SizeOption } from "@/types";

type SizeGroup = { slug: string; label: string };

export function MastersManager({
  colours,
  brands,
  collections,
  sizes,
  sizeGroups,
}: {
  colours: Colour[];
  brands: Brand[];
  collections: Collection[];
  sizes: SizeOption[];
  sizeGroups: SizeGroup[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Tabs defaultValue="colours">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="colours">Colours / finishes</TabsTrigger>
          <TabsTrigger value="brands">Mattress brands</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
        </TabsList>

        <TabsContent value="colours" className="mt-4 space-y-4">
          <ColourForm
            pending={pending}
            onSubmit={(label, hex) => {
              setError(null);
              startTransition(async () => {
                const res = await createColourAction({ label, hex });
                if (!res.ok) setError(res.error);
                else refresh();
              });
            }}
          />
          <TableWrap>
            <TableHeader>
              <TableRow>
                <TableHead>Swatch</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Hex</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colours.map((c) => (
                <ColourRow
                  key={c.id}
                  colour={c}
                  pending={pending}
                  onSave={(next) => {
                    setError(null);
                    startTransition(async () => {
                      await updateColourAction({
                        id: c.id,
                        label: next.name,
                        hex: next.hex,
                        isActive: true,
                      });
                      refresh();
                    });
                  }}
                  onDelete={() => {
                    setError(null);
                    startTransition(async () => {
                      const res = await deleteColourAction(c.id);
                      if (!res.ok) setError(res.error);
                      else refresh();
                    });
                  }}
                />
              ))}
            </TableBody>
          </TableWrap>
        </TabsContent>

        <TabsContent value="brands" className="mt-4 space-y-4">
          <AddNameForm
            label="Brand name"
            pending={pending}
            onSubmit={(name) => {
              setError(null);
              startTransition(async () => {
                const res = await createBrandAction({ name });
                if (!res.ok) setError(res.error);
                else refresh();
              });
            }}
          />
          <TableWrap>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((b) => (
                <BrandRow
                  key={b.id}
                  brand={b}
                  pending={pending}
                  onSave={(name) => {
                    startTransition(async () => {
                      await updateBrandAction({
                        id: b.id,
                        name,
                        isActive: true,
                      });
                      refresh();
                    });
                  }}
                  onDelete={() => {
                    setError(null);
                    startTransition(async () => {
                      const res = await deleteBrandAction(b.id);
                      if (!res.ok) setError(res.error);
                      else refresh();
                    });
                  }}
                />
              ))}
            </TableBody>
          </TableWrap>
        </TabsContent>

        <TabsContent value="collections" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Phase 1 PDF collections: Royal Range and Victoria. You can rename or
            add more if needed.
          </p>
          <CollectionAddForm
            pending={pending}
            onSubmit={(data) => {
              setError(null);
              startTransition(async () => {
                const res = await createCollectionAction(data);
                if (!res.ok) setError(res.error);
                else refresh();
              });
            }}
          />
          <TableWrap>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((c) => (
                <CollectionRow
                  key={c.id}
                  collection={c}
                  pending={pending}
                  onSave={(data) => {
                    startTransition(async () => {
                      await updateCollectionAction({
                        id: c.id,
                        ...data,
                        isActive: true,
                      });
                      refresh();
                    });
                  }}
                  onDelete={() => {
                    startTransition(async () => {
                      await deleteCollectionAction(c.id);
                      refresh();
                    });
                  }}
                />
              ))}
            </TableBody>
          </TableWrap>
        </TabsContent>

        <TabsContent value="sizes" className="mt-4 space-y-4">
          <SizeAddForm
            sizeGroups={sizeGroups}
            pending={pending}
            onSubmit={(data) => {
              setError(null);
              startTransition(async () => {
                const res = await createSizeAction(data);
                if (!res.ok) setError(res.error);
                else refresh();
              });
            }}
          />
          <TableWrap>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>L × W</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.group}</TableCell>
                  <TableCell>{s.label}</TableCell>
                  <TableCell>
                    {s.lengthIn} × {s.widthIn}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const res = await deleteSizeAction(s.id);
                          if (!res.ok) {
                            await updateSizeAction({
                              id: s.id,
                              isActive: false,
                            });
                            setError(res.error);
                          }
                          refresh();
                        });
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableWrap>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>{children}</Table>
    </div>
  );
}

function ColourForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (label: string, hex: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [hex, setHex] = useState("#C19A6B");
  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onSubmit(label, hex);
        setLabel("");
      }}
    >
      <div className="space-y-1">
        <Label>New colour / finish</Label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Sheesham"
        />
      </div>
      <div className="space-y-1">
        <Label>Hex</Label>
        <Input
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="w-28"
        />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" /> Add
      </Button>
    </form>
  );
}

function ColourRow({
  colour,
  pending,
  onSave,
  onDelete,
}: {
  colour: Colour;
  pending: boolean;
  onSave: (c: Colour) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(colour.name);
  const [hex, setHex] = useState(colour.hex);
  return (
    <TableRow>
      <TableCell>
        <span
          className="inline-block size-6 rounded border border-border"
          style={{ backgroundColor: hex }}
        />
      </TableCell>
      <TableCell>
        {editing ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          colour.name
        )}
      </TableCell>
      <TableCell>
        {editing ? (
          <Input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-28"
          />
        ) : (
          colour.hex
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          {editing ? (
            <Button
              size="sm"
              disabled={pending}
              onClick={() => {
                onSave({ ...colour, name, hex });
                setEditing(false);
              }}
            >
              Save
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function AddNameForm({
  label,
  pending,
  onSubmit,
}: {
  label: string;
  pending: boolean;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit(name);
        setName("");
      }}
    >
      <div className="space-y-1">
        <Label>{label}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" /> Add
      </Button>
    </form>
  );
}

function BrandRow({
  brand,
  pending,
  onSave,
  onDelete,
}: {
  brand: Brand;
  pending: boolean;
  onSave: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(brand.name);
  return (
    <TableRow>
      <TableCell>
        {editing ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          brand.name
        )}
      </TableCell>
      <TableCell className="font-mono text-xs">{brand.id}</TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          {editing ? (
            <Button
              size="sm"
              disabled={pending}
              onClick={() => {
                onSave(name);
                setEditing(false);
              }}
            >
              Save
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function CollectionAddForm({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (data: {
    name: string;
    description: string;
    featured: boolean;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name, description, featured: false });
        setName("");
        setDescription("");
      }}
    >
      <div className="space-y-1">
        <Label>Collection name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="min-w-[12rem] flex-1 space-y-1">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" /> Add
      </Button>
    </form>
  );
}

function CollectionRow({
  collection,
  pending,
  onSave,
  onDelete,
}: {
  collection: Collection;
  pending: boolean;
  onSave: (data: {
    name: string;
    description: string;
    featured: boolean;
  }) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);
  return (
    <TableRow>
      <TableCell>
        {editing ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          collection.name
        )}
      </TableCell>
      <TableCell className="font-mono text-xs">{collection.slug}</TableCell>
      <TableCell>
        {collection.featured ? <Badge>Featured</Badge> : "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          {editing ? (
            <Button
              size="sm"
              disabled={pending}
              onClick={() => {
                onSave({
                  name,
                  description,
                  featured: collection.featured,
                });
                setEditing(false);
              }}
            >
              Save
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
        {editing && (
          <Input
            className="mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        )}
      </TableCell>
    </TableRow>
  );
}

function SizeAddForm({
  sizeGroups,
  pending,
  onSubmit,
}: {
  sizeGroups: SizeGroup[];
  pending: boolean;
  onSubmit: (data: {
    sizeGroupSlug: string;
    lengthIn: number;
    widthIn: number;
  }) => void;
}) {
  const [sizeGroupSlug, setSizeGroupSlug] = useState(
    sizeGroups[0]?.slug ?? "single",
  );
  const [lengthIn, setLengthIn] = useState(72);
  const [widthIn, setWidthIn] = useState(36);
  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ sizeGroupSlug, lengthIn, widthIn });
      }}
    >
      <div className="space-y-1">
        <Label>Group</Label>
        <select
          className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
          value={sizeGroupSlug}
          onChange={(e) => setSizeGroupSlug(e.target.value)}
        >
          {sizeGroups.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Length (in)</Label>
        <Input
          type="number"
          className="w-24"
          value={lengthIn}
          onChange={(e) => setLengthIn(Number(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label>Width (in)</Label>
        <Input
          type="number"
          className="w-24"
          value={widthIn}
          onChange={(e) => setWidthIn(Number(e.target.value))}
        />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" /> Add size
      </Button>
    </form>
  );
}
