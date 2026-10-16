"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { useStaffSession } from "@/hooks/use-staff-session";
import { isDevMode } from "@/lib/env";
import { cn } from "@/lib/utils";
import { mockStaffLogin, verifyMockOtp } from "@/services/session";
import type { StaffSession } from "@/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, ready, login } = useStaffSession();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingStaff, setPendingStaff] = useState<StaffSession | null>(null);
  const [credsOpen, setCredsOpen] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace(ROUTES.admin.dashboard);
    }
  }, [ready, session, router]);

  function fillDemoCredentials() {
    setMobile(DEMO.adminMobile);
    setPassword(DEMO.adminPassword);
    setOtp("");
    setPendingStaff(null);
    setCredsOpen(false);
    toast.message("Demo credentials filled", {
      description: "Continue, then enter any 6-digit OTP.",
    });
  }

  function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    const staff = mockStaffLogin(mobile, password);
    if (!staff) {
      toast.error("Invalid phone or password");
      return;
    }
    setPendingStaff(staff);
    setOtp("");
    toast.message("OTP sent (mock)", {
      description: "Enter any 6 digits to continue.",
    });
  }

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingStaff) return;
    if (!verifyMockOtp(otp)) {
      toast.error("OTP must be any 6 digits");
      return;
    }
    login(pendingStaff);
    toast.success(`Welcome, ${pendingStaff.name}`);
    router.replace(ROUTES.admin.dashboard);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandMark href={ROUTES.admin.login} className="[&_img]:h-10 md:[&_img]:h-12" />
          <h1 className="font-heading text-3xl text-ink">Team console</h1>
          <p className="text-sm text-muted-foreground">
            Lingampally operations (prototype)
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          {!pendingStaff ? (
            <form onSubmit={submitCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center rounded-lg border border-input bg-muted px-3 text-sm">
                    +91
                  </span>
                  <Input
                    id="mobile"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-ink">
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-4">
              <div className="space-y-1">
                <p className="font-heading text-lg text-ink">Enter OTP</p>
                <p className="text-sm text-muted-foreground">
                  Mock code sent to +91 {mobile}. Use any 6 digits.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit OTP</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="tracking-[0.35em]"
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-ink">
                Verify & sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setPendingStaff(null);
                  setOtp("");
                }}
              >
                Back to mobile & password
              </Button>
            </form>
          )}

          {isDevMode && !pendingStaff && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setCredsOpen(true)}
            >
              <KeyRound className="size-4" />
              Dev credentials
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href={ROUTES.home} className="underline underline-offset-2">
            Back to storefront
          </Link>
        </p>
      </div>

      {isDevMode && (
        <Dialog open={credsOpen} onOpenChange={setCredsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Admin test credentials</DialogTitle>
              <DialogDescription>
                Shown only when <code className="text-xs">NEXT_PUBLIC_DEV_MODE=true</code>
              </DialogDescription>
            </DialogHeader>
            <dl className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-mono">{DEMO.adminMobile}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Password</dt>
                <dd className="font-mono">{DEMO.adminPassword}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">OTP</dt>
                <dd className="font-mono">any 6 digits (next step)</dd>
              </div>
            </dl>
            <button
              type="button"
              className={cn(buttonVariants(), "w-full bg-ink")}
              onClick={fillDemoCredentials}
            >
              Fill form & close
            </button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
