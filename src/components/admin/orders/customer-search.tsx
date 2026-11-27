"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { searchCustomersAction } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/format";
import type { CustomerMatch } from "@/types/admin-orders";

/** Finds a customer account; picking one fills the customer fields and links the order to it. */
export function CustomerSearch({ onPick }: { onPick: (customer: CustomerMatch) => void }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CustomerMatch[] | null>(null);
  const [isSearching, startSearch] = useTransition();

  function search() {
    startSearch(async () => {
      const result = await searchCustomersAction(query);
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
      {matches?.length === 0 ? <p className="text-xs text-muted-foreground">No customer found. Type the details below.</p> : null}
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
