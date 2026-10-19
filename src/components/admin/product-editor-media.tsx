/** Read-only media placeholders — upload/edit deferred. */

export function ProductEditorMedia({
  imageUrls,
  note,
}: {
  imageUrls: string[];
  note?: string;
}) {
  const slots = imageUrls.length
    ? imageUrls.slice(0, 6)
    : Array.from({ length: 4 }, () => null);

  return (
    <section className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0">
        <h2 className="font-heading text-lg">Media</h2>
        <p className="text-sm text-muted-foreground break-words">
          {note ?? "Placeholders only — image upload comes later."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {slots.map((url, i) => (
          <div
            key={url ?? `ph-${i}`}
            className="relative aspect-square min-w-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60"
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="size-full object-cover opacity-90" />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                Photo {i + 1}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-ink/70 px-2 py-1 text-[10px] text-white">
              Locked
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
