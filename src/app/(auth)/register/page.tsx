"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { signUpWithEmail } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, null);

  return (
    <div className="fade-up space-y-6 rounded-2xl bg-card/80 p-6 shadow-sm ring-1 ring-border backdrop-blur md:p-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Email sign-up for now. Mobile OTP will plug into the same profile later.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Area / pincode (optional)</Label>
          <Input id="area" name="area" placeholder="e.g. Lingampally / 500019" />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="privacy"
            required
            className="mt-1 size-4 rounded border-input"
          />
          <span>
            I agree to the{" "}
            <Link href={ROUTES.privacy} className="underline underline-offset-2">
              privacy notice
            </Link>
            .
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="whatsappOffers"
            className="mt-1 size-4 rounded border-input"
          />
          <span>Send me WhatsApp offers (optional).</span>
        </label>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="text-foreground underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </div>
  );
}
