import { storeInfo } from "@/data/mock";

export default function PrivacyPage() {
  return (
    <article className="fade-up prose prose-sm dark:prose-invert max-w-none rounded-2xl bg-card/80 p-6 ring-1 ring-border md:p-8">
      <h1 className="font-heading text-3xl">Privacy notice</h1>
      <p className="text-muted-foreground">{storeInfo.privacyNotice}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Collected: mobile, name, area (optional), browsing events, shortlist, CTA taps.</li>
        <li>Purpose: personalise the catalogue, follow up on Visit Store / Contact, delivery updates.</li>
        <li>Marketing WhatsApp is opt-in only; service messages are separate.</li>
        <li>This Phase 1 build stores demo session data in your browser only — not a live backend.</li>
        <li>Data requests: contact {storeInfo.phone} or WhatsApp the store number.</li>
      </ul>
    </article>
  );
}
