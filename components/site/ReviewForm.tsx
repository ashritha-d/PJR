"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Star, Loader2 } from "lucide-react";

export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (status !== "authenticated") {
    return (
      <div className="rounded-2xl bg-forest-50 p-5 text-sm text-forest-600">
        <Link href="/login" className="font-semibold text-forest-800 hover:underline">
          Login
        </Link>{" "}
        to write a review for this product.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-forest-50 p-5 text-sm text-forest-600">
        Thank you! Your review has been submitted and will appear once approved by our team.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 5) {
      toast.error("Please write a slightly longer review");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, comment }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }
    toast.success("Review submitted!");
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h4 className="font-display font-semibold text-forest-800">Write a Review</h4>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
          >
            <Star
              size={24}
              className={i <= (hoverRating || rating) ? "fill-gold text-gold" : "fill-forest-100 text-forest-100"}
            />
          </button>
        ))}
      </div>
      <input
        className="input-field"
        placeholder="Review title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />
      <textarea
        className="input-field"
        rows={3}
        placeholder="Share your experience with this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading && <Loader2 size={16} className="animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}
