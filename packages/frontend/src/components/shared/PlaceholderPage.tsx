interface PlaceholderPageProps {
  title: string;
  description?: string;
}
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-[hsl(var(--color-muted))]">
          {description ?? 'Coming soon'}
        </p>
      </div>
    </div>
  );
}
