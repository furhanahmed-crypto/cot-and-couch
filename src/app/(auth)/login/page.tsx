"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND, DEMO } from "@/constants/brand";
import { ROUTES, STORAGE_KEYS } from "@/constants/routes";
import { writeJson } from "@/services/storage";

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);
  const [offers, setOffers] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!consent) {
      toast.error("Please accept the privacy notice to continue");
      return;
    }
    writeJson(STORAGE_KEYS.pendingMobile, { mobile, offers });
    writeJson(STORAGE_KEYS.mockOtp, DEMO.customerOtp);
    toast.message("Mock OTP sent", {
      description: `Use ${DEMO.customerOtp} (or any 6 digits). No SMS is sent.`,
    });
    router.push(ROUTES.verify);
  }

  return (
    <div className="fade-up space-y-6 rounded-2xl bg-card/80 p-6 shadow-sm ring-1 ring-border backdrop-blur md:p-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl tracking-tight">Enter the digital window</h1>
        <p className="text-sm text-muted-foreground">{BRAND.shortTagline}. Browse prices, finishes, and stock — then visit our Lingampally showroom.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-lg border border-input bg-muted px-3 text-sm">+91</span>
            <Input
              id="mobile"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
            />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
          <span>
            I agree to the{" "}
            <Link href={ROUTES.privacy} className="underline underline-offset-2">
              privacy notice
            </Link>{" "}
            (browsing may be recorded to personalise the catalogue).
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={offers} onCheckedChange={(v) => setOffers(v === true)} className="mt-0.5" />
          <span>Send me WhatsApp offers (optional — separate from delivery updates).</span>
        </label>
        <Button type="submit" className="w-full">
          Continue with OTP
        </Button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        Prototype only — OTP is mocked. Staff?{" "}
        <Link href={ROUTES.admin.login} className="underline">
          Admin console
        </Link>
      </p>
    </div>
  );
}
