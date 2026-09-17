"use client";

import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 text-center">
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${danger ? "bg-red-50 text-red-500" : "bg-forest-50 text-forest-600"}`}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-forest-800">{title}</h3>
        {description && <p className="mt-2 text-sm text-forest-500">{description}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-forest-700 hover:bg-forest-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
