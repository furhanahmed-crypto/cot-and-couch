"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminOtpStep({
  mobile,
  otp,
  onOtpChange,
  onBack,
  onVerify,
}: {
  mobile: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onBack: () => void;
  onVerify: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onVerify} className="space-y-4">
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
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="tracking-[0.35em]"
          autoFocus
          required
        />
      </div>
      <Button type="submit" className="w-full bg-ink">
        Verify & sign in
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back to mobile & password
      </Button>
    </form>
  );
}
