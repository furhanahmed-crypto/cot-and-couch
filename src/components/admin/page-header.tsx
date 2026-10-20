export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-xl tracking-tight break-words text-ink sm:text-2xl md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm break-words text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}
