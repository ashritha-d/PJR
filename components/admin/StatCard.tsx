import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "bg-forest-700",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className={`inline-flex rounded-xl ${accent} p-2.5 text-cream-100`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-forest-800">{value}</p>
      <p className="text-xs text-forest-500">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-gold-dark">{hint}</p>}
    </div>
  );
}
