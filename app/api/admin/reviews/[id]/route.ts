import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { recalculateProductRating } from "@/lib/recalculate-rating";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = (await req.json()) as { status: string };

  const review = await prisma.review.update({ where: { id }, data: { status } });
  await recalculateProductRating(review.productId);

  return NextResponse.json({ review });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const review = await prisma.review.delete({ where: { id } });
  await recalculateProductRating(review.productId);

  return NextResponse.json({ success: true });
}
