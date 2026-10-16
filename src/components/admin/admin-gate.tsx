"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { MockBanner } from "@/components/admin/mock-banner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { isAdminProfile } from "@/services/profile";

export function AdminGate({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    isAdminProfile().then(setOk);
  }, []);

  if (ok === null) {
    return (
      <p className="text-sm text-muted-foreground">Checking permissions…</p>
    );
  }

  if (!ok) {
    return (
      <div className="space-y-6">
        <MockBanner compact />
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <Lock className="size-5 text-brass" />
              {title}
            </CardTitle>
            <CardDescription>
              This area is restricted to the admin role. Your profile role must be{" "}
              <code>admin</code> in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={ROUTES.admin.dashboard}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back to dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
