import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-stone">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, #d47c4a33, transparent 50%), radial-gradient(ellipse at 90% 20%, #3e272322, transparent 45%)",
        }}
      />
      <div className="relative mx-auto flex min-h-svh max-w-lg flex-col px-4 py-6">
        <div className="mb-8 flex items-center justify-between">
          <BrandMark href="/login" className="[&_img]:h-9 md:[&_img]:h-11" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 flex-col justify-center pb-10">{children}</div>
      </div>
    </div>
  );
}
