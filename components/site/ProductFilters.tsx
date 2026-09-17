"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

type Category = { name: string; slug: string };

const PRICE_RANGES = [
  { label: "Under ₹100", min: "", max: "100" },
  { label: "₹100 – ₹300", min: "100", max: "300" },
  { label: "₹300 – ₹600", min: "300", max: "600" },
  { label: "Above ₹600", min: "600", max: "" },
];

export function ProductFilters({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current = {
    category: searchParams.get("category") ?? "",
    subcategory: searchParams.get("subcategory") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    availability: searchParams.get("availability") ?? "",
    minRating: searchParams.get("minRating") ?? "",
    sort: searchParams.get("sort") ?? "newest",
    q: searchParams.get("q") ?? "",
  };

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
    setDrawerOpen(false);
  }

  const hasActiveFilters =
    current.category || current.subcategory || current.minPrice || current.maxPrice || current.availability || current.minRating;

  const Panel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-forest-800">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs font-medium text-forest-500 hover:text-forest-800">
            Clear all
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-forest-700">Category</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-forest-600">
            <input
              type="radio"
              checked={current.category === ""}
              onChange={() => updateParams({ category: "" })}
              className="accent-forest-700"
            />
            All Categories
          </label>
          {categories.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2 text-sm text-forest-600">
              <input
                type="radio"
                checked={current.category === c.slug}
                onChange={() => updateParams({ category: c.slug, subcategory: "" })}
                className="accent-forest-700"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {subcategories.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-forest-700">Subcategory</h4>
          <select
            className="input-field"
            value={current.subcategory}
            onChange={(e) => updateParams({ subcategory: e.target.value })}
          >
            <option value="">All Subcategories</option>
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h4 className="mb-3 text-sm font-semibold text-forest-700">Price Range</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-forest-600">
            <input
              type="radio"
              checked={!current.minPrice && !current.maxPrice}
              onChange={() => updateParams({ minPrice: "", maxPrice: "" })}
              className="accent-forest-700"
            />
            Any Price
          </label>
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex cursor-pointer items-center gap-2 text-sm text-forest-600">
              <input
                type="radio"
                checked={current.minPrice === r.min && current.maxPrice === r.max}
                onChange={() => updateParams({ minPrice: r.min, maxPrice: r.max })}
                className="accent-forest-700"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-forest-700">Availability</h4>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-forest-600">
          <input
            type="checkbox"
            checked={current.availability === "IN_STOCK"}
            onChange={(e) => updateParams({ availability: e.target.checked ? "IN_STOCK" : "" })}
            className="accent-forest-700"
          />
          In Stock Only
        </label>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-forest-700">Minimum Rating</h4>
        <div className="space-y-2">
          {["", "4", "3"].map((r) => (
            <label key={r || "any"} className="flex cursor-pointer items-center gap-2 text-sm text-forest-600">
              <input
                type="radio"
                checked={current.minRating === r}
                onChange={() => updateParams({ minRating: r })}
                className="accent-forest-700"
              />
              {r ? `${r}★ & above` : "Any Rating"}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className="btn-secondary w-full !py-2.5 lg:hidden"
      >
        <SlidersHorizontal size={16} /> Filters
      </button>

      <aside className="card sticky top-24 hidden h-fit p-6 lg:block">{Panel}</aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display font-bold text-forest-800">Filter Products</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            {Panel}
            <button onClick={() => setDrawerOpen(false)} className="btn-primary mt-6 w-full">
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
