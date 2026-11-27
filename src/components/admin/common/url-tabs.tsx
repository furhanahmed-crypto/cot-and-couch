"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlParams } from "@/hooks/use-url-params";

export type UrlTab = { value: string; label: string; content: ReactNode };

/** Tabs whose choice is kept in `?tab=`, so reloads and links open the same tab. */
export function UrlTabs({ tabs }: { tabs: UrlTab[] }) {
  const { searchParams, setParams } = useUrlParams();
  const requested = searchParams.get("tab");
  const current = tabs.some((tab) => tab.value === requested) ? requested! : tabs[0].value;

  return (
    <Tabs value={current} onValueChange={(value) => setParams({ tab: value === tabs[0].value ? null : String(value) }, { keepPage: true })}>
      <div className="-mx-1 overflow-x-auto px-1">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-3">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
