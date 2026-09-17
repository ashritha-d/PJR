import Link from "next/link";
import { LucideIcon, PackageOpen } from "lucide-react";

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-forest-200 bg-forest-50/50 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-white p-4 shadow-card">
        <Icon size={32} className="text-forest-400" />
      </div>
      <h3 className="font-display text-xl font-semibold text-forest-800">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-forest-500">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
