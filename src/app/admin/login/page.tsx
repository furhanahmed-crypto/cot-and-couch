"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { staffSignIn } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(staffSignIn, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <BrandMark href={ROUTES.admin.login} className="[&_img]:h-10 md:[&_img]:h-12" />
          <h1 className="font-heading text-3xl text-ink">Team console</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your staff email and password.
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="staff@cotandcouch.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full bg-ink" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Need access? Contact your store administrator.
          <br />
          <Link href={ROUTES.home} className="underline underline-offset-2">
            Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
