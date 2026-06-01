export default function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
      <div
        className="h-full bg-accent rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
