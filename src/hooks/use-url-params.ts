"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Read and change `?key=` values. Changing a filter resets `?page=`, because
 * the old page number may not exist in the new results.
 */
export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParams(changes: Record<string, string | null>, options: { keepPage?: boolean } = {}) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!options.keepPage) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return { searchParams, setParams };
}
