import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to write a review" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      audience: "ADMIN",
      title: "New review submitted",
      message: `${session.user.name} reviewed "${product.name}". Awaiting approval.`,
      type: "NEW_REVIEW",
    },
  });

  return NextResponse.json({ success: true, message: "Thank you! Your review has been submitted for approval." });
}
