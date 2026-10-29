"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteLeadAction,
  updateLeadAction,
} from "@/app/admin/ops/actions";
import { AppSelect } from "@/components/ui/app-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminLead } from "@/services/leads";
import type { Lead } from "@/types";

type IntentFilter = "all" | Lead["intent"];
type FollowUpFilter = "all" | "open" | "done";

export function LeadsManager({ leads }: { leads: AdminLead[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<IntentFilter>("all");
  const [followUp, setFollowUp] = useState<FollowUpFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (intent !== "all" && l.intent !== intent) return false;
      if (followUp === "open" && l.followUpDone) return false;
      if (followUp === "done" && !l.followUpDone) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        l.mobile.toLowerCase().includes(q) ||
        (l.area ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, query, intent, followUp]);

  return (
    <div className="min-w-0 space-y-3">
      <p className="text-sm text-muted-foreground">
        Storefront sign-ups sync here automatically. Filter and update intent as
        you follow up.
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, area…"
          className="h-9 w-full min-w-0 sm:max-w-xs"
        />
        <AppSelect
          value={intent}
          onValueChange={(v) => setIntent(v as IntentFilter)}
          triggerClassName="h-9 w-[7.5rem]"
          items={[
            { value: "all", label: "Intent: All" },
            { value: "hot", label: "Hot" },
            { value: "warm", label: "Warm" },
            { value: "cold", label: "Cold" },
          ]}
        />
        <AppSelect
          value={followUp}
          onValueChange={(v) => setFollowUp(v as FollowUpFilter)}
          triggerClassName="h-9 w-[9rem]"
          items={[
            { value: "all", label: "Follow-up: All" },
            { value: "open", label: "Open" },
            { value: "done", label: "Done" },
          ]}
        />
        <p className="text-xs text-muted-foreground sm:ml-auto">
          {filtered.length} of {leads.length} leads
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">Name</TableHead>
              <TableHead className="min-w-[160px]">Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="whitespace-nowrap">Joined</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="font-medium">{l.name}</div>
                  {l.area ? (
                    <div className="text-xs text-muted-foreground">{l.area}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{l.email || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.mobile && l.mobile !== l.email ? l.mobile : "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      l.source === "storefront"
                        ? "bg-emerald-500/15 font-normal text-emerald-800 dark:text-emerald-300"
                        : "font-normal"
                    }
                  >
                    {l.source === "storefront" ? "Storefront" : "Manual"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {l.firstSeen}
                </TableCell>
                <TableCell>
                  <AppSelect
                    value={l.intent}
                    disabled={pending}
                    triggerClassName="w-[6.5rem] capitalize"
                    onValueChange={(v) => {
                      const next = v as Lead["intent"];
                      startTransition(async () => {
                        await updateLeadAction({
                          id: l.id,
                          intent: next,
                          followUpDone: l.followUpDone,
                        });
                        router.refresh();
                      });
                    }}
                    items={[
                      { value: "hot", label: "hot" },
                      { value: "warm", label: "warm" },
                      { value: "cold", label: "cold" },
                    ]}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={l.followUpDone ? "secondary" : "default"}>
                    {l.followUpDone ? "Done" : "Open"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await updateLeadAction({
                            id: l.id,
                            intent: l.intent,
                            followUpDone: !l.followUpDone,
                          });
                          router.refresh();
                        });
                      }}
                    >
                      Toggle
                    </Button>
                    {l.source === "manual" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            await deleteLeadAction(l.id);
                            toast.success("Lead removed");
                            router.refresh();
                          });
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {leads.length === 0
                    ? "No leads yet — customers appear here after storefront login."
                    : "No leads match these filters."}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
