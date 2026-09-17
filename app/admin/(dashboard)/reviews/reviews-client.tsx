"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, EyeOff, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StarRating } from "@/components/ui/StarRating";
import { formatDate } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: string;
  createdAt: string;
  product: { name: string };
  user: { name: string; email: string };
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-600",
  APPROVED: "bg-forest-100 text-forest-700",
  HIDDEN: "bg-forest-50 text-forest-400",
};

export function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update review");
      return;
    }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Review ${status.toLowerCase()}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete review");
      setDeleteTarget(null);
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    toast.success("Review deleted");
    setDeleteTarget(null);
  }

  const filtered = filter ? reviews.filter((r) => r.status === filter) : reviews;

  const columns: Column<Review>[] = [
    {
      key: "review",
      header: "Review",
      render: (r) => (
        <div className="max-w-xs">
          <StarRating rating={r.rating} size={12} />
          {r.title && <p className="mt-1 text-sm font-semibold text-forest-800">{r.title}</p>}
          <p className="line-clamp-2 text-xs text-forest-500">{r.comment}</p>
        </div>
      ),
    },
    { key: "product", header: "Product", render: (r) => r.product.name },
    { key: "customer", header: "Customer", render: (r) => r.user.name },
    { key: "date", header: "Date", render: (r) => formatDate(r.createdAt) },
    {
      key: "status",
      header: "Status",
      render: (r) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>{r.status}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          {r.status !== "APPROVED" && (
            <button onClick={() => updateStatus(r.id, "APPROVED")} className="rounded-lg p-1.5 text-forest-600 hover:bg-forest-50" title="Approve">
              <Check size={16} />
            </button>
          )}
          {r.status !== "HIDDEN" && (
            <button onClick={() => updateStatus(r.id, "HIDDEN")} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50" title="Hide">
              <EyeOff size={16} />
            </button>
          )}
          <button onClick={() => setDeleteTarget(r)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <select className="input-field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All Reviews</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="HIDDEN">Hidden</option>
      </select>

      {loading ? (
        <div className="card p-10 text-center text-sm text-forest-400">Loading reviews...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} emptyMessage="No reviews found." />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this review?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
