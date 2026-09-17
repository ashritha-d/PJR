import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCouponDiscount } from "@/lib/order-math";

export async function POST(req: NextRequest) {
  const { code, subtotal } = (await req.json()) as { code: string; subtotal: number };

  if (!code) return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon || coupon.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.expiryDate) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }
  if (subtotal < coupon.minOrderAmount) {
    return NextResponse.json(
      { error: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}` },
      { status: 400 }
    );
  }

  const discount = calculateCouponDiscount({
    subtotal,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscount: coupon.maxDiscount,
  });

  return NextResponse.json({
    code: coupon.code,
    discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  });
}
