"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { searchCustomersAction } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/format";
import type { ActionResult } from "@/types/action";
import type { CustomerMatch } from "@/types/admin-orders";

type CustomerSearchProps = {
  onPick: (customer: CustomerMatch) => void;
  /** The server action that searches; the Team screen passes its admin-only one. */
  search?: (query: string) => Promise<ActionResult<CustomerMatch[]>>;
};

/** Finds a registered customer account by name, email or phone. */
export function CustomerSearch({ onPick, search: searchAction = searchCustomersAction }: CustomerSearchProps) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CustomerMatch[] | null>(null);
  const [isSearching, startSearch] = useTransition();

  function search() {
    startSearch(async () => {
      const result = await searchAction(query);
      if (result.ok) setMatches(result.data);
      else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          aria-label="Search customers"
          placeholder="Search existing customers by name, email or phone"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              search();
            }
          }}
        />
        <Button type="button" variant="outline" disabled={isSearching || query.trim().length < 2} onClick={search}>
          <Search className="size-4" /> Search
        </Button>
      </div>
      {matches?.length === 0 ? <p className="text-xs text-muted-foreground">No customer found.</p> : null}
      {matches?.length ? (
        <ul className="divide-y divide-border/60 rounded-md ring-1 ring-border/60">
          {matches.map((customer) => (
            <li key={customer.profileId}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onPick(customer);
                  setMatches(null);
                }}
              >
                <span className="font-medium">{customer.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {[customer.phone ? formatPhone(customer.phone) : null, customer.email].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
