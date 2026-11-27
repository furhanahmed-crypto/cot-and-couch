/** "Good to know" lines from the client's price list (e.g. sofas are made to order). */
export function PdpNotes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div className="space-y-2 rounded-xl border border-border/60 p-4">
      <h2 className="text-sm font-medium">Good to know</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
