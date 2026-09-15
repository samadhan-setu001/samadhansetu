export function EmptyState({
  title,
  detail,
  action
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-paper-line px-6 py-14 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      {detail && <p className="max-w-sm text-sm text-ink-soft">{detail}</p>}
      {action}
    </div>
  );
}
