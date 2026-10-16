"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES, STORAGE_KEYS } from "@/constants/routes";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { readJson } from "@/services/storage";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useCustomerSession();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const pending = readJson<{ mobile: string; offers: boolean } | null>(
    STORAGE_KEYS.pendingMobile,
    null,
  );

  useEffect(() => {
    if (!pending?.mobile) router.replace(ROUTES.login);
  }, [pending, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please enter your name");
      return;
    }
    login({
      mobile: pending!.mobile,
      name: name.trim(),
      area: area.trim() || undefined,
      whatsappOffers: pending!.offers,
      loggedInAt: new Date().toISOString(),
    });
    toast.success("Welcome to Cot & Couch");
    router.replace(ROUTES.home);
  }

  return (
    <div className="fade-up space-y-6 rounded-2xl bg-card/80 p-6 shadow-sm ring-1 ring-border backdrop-blur md:p-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl">Almost there</h1>
        <p className="text-sm text-muted-foreground">
          First visit for +91 {pending?.mobile}. Tell us how to greet you in the showroom.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Area / pincode (optional)</Label>
          <Input
            id="area"
            placeholder="e.g. Lingampally / 500019"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Enter catalogue
        </Button>
      </form>
    </div>
  );
}
