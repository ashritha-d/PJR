"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative z-10 max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-forest-800">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-forest-400 hover:bg-forest-50 hover:text-forest-700">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
