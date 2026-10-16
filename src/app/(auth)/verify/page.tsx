"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO } from "@/constants/brand";
import { ROUTES, STORAGE_KEYS } from "@/constants/routes";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { verifyMockOtp } from "@/services/session";
import { readJson } from "@/services/storage";

export default function VerifyPage() {
  const router = useRouter();
  const { login } = useCustomerSession();
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [resends, setResends] = useState(0);
  const pending = readJson<{ mobile: string; offers: boolean } | null>(
    STORAGE_KEYS.pendingMobile,
    null,
  );

  useEffect(() => {
    if (!pending?.mobile) router.replace(ROUTES.login);
  }, [pending, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyMockOtp(otp)) {
      toast.error("Enter a 6-digit OTP");
      return;
    }
    const known = ["9848012345", "9123456780"].includes(pending!.mobile);
    if (!known) {
      router.push(ROUTES.register);
      return;
    }
    login({
      mobile: pending!.mobile,
      name: pending!.mobile === "9848012345" ? "Ananya Reddy" : "Karthik Rao",
      area: pending!.mobile === "9848012345" ? "Gachibowli" : "Miyapur",
      whatsappOffers: pending!.offers,
      loggedInAt: new Date().toISOString(),
    });
    toast.success("Welcome back");
    router.replace(ROUTES.home);
  }

  return (
    <div className="fade-up space-y-6 rounded-2xl bg-card/80 p-6 shadow-sm ring-1 ring-border backdrop-blur md:p-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl">Verify OTP</h1>
        <p className="text-sm text-muted-foreground">
          Sent to +91 {pending?.mobile}. Mock code: <strong>{DEMO.customerOtp}</strong>
        </p>
      </div>
      <form onSubmit={verify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">6-digit OTP</Label>
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="tracking-[0.4em]"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Verify & enter catalogue
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        disabled={seconds > 0 || resends >= 3}
        onClick={() => {
          setResends((r) => r + 1);
          setSeconds(30);
          toast.message("Mock OTP resent", { description: DEMO.customerOtp });
        }}
      >
        {seconds > 0 ? `Resend in ${seconds}s` : resends >= 3 ? "Max resends reached" : "Resend OTP"}
      </Button>
    </div>
  );
}
