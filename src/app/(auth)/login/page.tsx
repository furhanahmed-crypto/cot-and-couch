"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { signInWithEmail } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInWithEmail, null);

  return (
    <div className="fade-up space-y-6 rounded-2xl bg-card/80 p-6 shadow-sm ring-1 ring-border backdrop-blur md:p-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          {BRAND.shortTagline}. Sign in with email to browse the digital window.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href={ROUTES.register} className="text-foreground underline underline-offset-2">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Staff?{" "}
        <Link href={ROUTES.admin.login} className="underline">
          Admin console
        </Link>
      </p>
    </div>
  );
}
