import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/** Old mock OTP step — email auth replaced it. */
export default function VerifyPage() {
  return (
    <div className="space-y-4 rounded-2xl bg-card/80 p-6 text-center ring-1 ring-border md:p-8">
      <h1 className="font-heading text-2xl">OTP login moved</h1>
      <p className="text-sm text-muted-foreground">
        We now use email sign-in. Mobile OTP will return later on the same profile.
      </p>
      <Link href={ROUTES.login} className={cn(buttonVariants(), "inline-flex")}>
        Go to sign in
      </Link>
    </div>
  );
}
