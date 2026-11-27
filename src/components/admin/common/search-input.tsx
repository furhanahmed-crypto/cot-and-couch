"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUrlParams } from "@/hooks/use-url-params";

const SEARCH_DELAY_MS = 300;

type SearchInputProps = { placeholder: string; paramName?: string };

/** Writes `?q=` to the URL 300 ms after typing stops. */
export function SearchInput({ placeholder, paramName = "q" }: SearchInputProps) {
  const { searchParams, setParams } = useUrlParams();
  const urlValue = searchParams.get(paramName) ?? "";
  const [text, setText] = useState(urlValue);
  const [syncedValue, setSyncedValue] = useState(urlValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The URL changed from elsewhere (e.g. "Clear filters"): show the new value.
  if (urlValue !== syncedValue) {
    setSyncedValue(urlValue);
    if (urlValue !== text.trim()) setText(urlValue);
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function onChange(value: string) {
    setText(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setParams({ [paramName]: value.trim() || null }), SEARCH_DELAY_MS);
  }

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={text}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
}
