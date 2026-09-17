"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-forest-200 p-2 text-forest-600 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-forest-300">…</span>}
          <button
            onClick={() => goTo(p)}
            className={`h-9 w-9 rounded-full text-sm font-medium transition ${
              p === page ? "bg-forest-700 text-cream-100" : "text-forest-600 hover:bg-forest-50"
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-forest-200 p-2 text-forest-600 disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
