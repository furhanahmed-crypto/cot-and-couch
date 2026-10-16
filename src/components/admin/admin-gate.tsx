"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { MockBanner } from "@/components/admin/mock-banner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useStaffSession } from "@/hooks/use-staff-session";
import { cn } from "@/lib/utils";

export function AdminGate({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const { isAdmin, ready } = useStaffSession();

  if (!ready) return null;

  if (!isAdmin) {
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
              This area is restricted to admin role in the mock console. Log in as admin to access.
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
