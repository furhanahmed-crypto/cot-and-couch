"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createOptionAction,
  createOptionGroupAction,
  deleteOptionAction,
  deleteOptionGroupAction,
} from "@/app/admin/attributes/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Group = {
  id: string;
  key: string;
  label: string;
  options: {
    id: string;
    label: string;
    slug: string;
    hex: string | null;
    isActive: boolean;
  }[];
};

export function AttributesManager({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [groupLabel, setGroupLabel] = useState("");
  const [newLabels, setNewLabels] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form
        className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!groupLabel.trim()) return;
          setError(null);
          startTransition(async () => {
            const res = await createOptionGroupAction({
              key: groupLabel,
              label: groupLabel,
            });
            if (!res.ok) setError(res.error);
            else {
              setGroupLabel("");
              router.refresh();
            }
          });
        }}
      >
        <div className="space-y-1">
          <Label>New option group</Label>
          <Input
            value={groupLabel}
            onChange={(e) => setGroupLabel(e.target.value)}
            placeholder="e.g. wood_type"
          />
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" /> Add group
        </Button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="font-heading text-lg">{g.label}</CardTitle>
                <p className="font-mono text-xs text-muted-foreground">{g.key}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  if (
                    !confirm(
                      `Delete group “${g.label}” and all its options?`,
                    )
                  )
                    return;
                  startTransition(async () => {
                    await deleteOptionGroupAction(g.id);
                    router.refresh();
                  });
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1.5">
                {g.options.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {o.hex && (
                        <span
                          className="size-3 rounded-full ring-1 ring-border"
                          style={{ background: o.hex }}
                        />
                      )}
                      {o.label}
                      {!o.isActive && (
                        <Badge variant="secondary">Off</Badge>
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await deleteOptionAction(o.id);
                          router.refresh();
                        });
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const label = newLabels[g.key]?.trim();
                  if (!label) return;
                  startTransition(async () => {
                    await createOptionAction({ groupKey: g.key, label });
                    setNewLabels((prev) => ({ ...prev, [g.key]: "" }));
                    router.refresh();
                  });
                }}
              >
                <Input
                  value={newLabels[g.key] ?? ""}
                  onChange={(e) =>
                    setNewLabels((prev) => ({
                      ...prev,
                      [g.key]: e.target.value,
                    }))
                  }
                  placeholder={`Add ${g.label.toLowerCase()}…`}
                />
                <Button type="submit" size="sm" disabled={pending}>
                  <Plus className="size-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
