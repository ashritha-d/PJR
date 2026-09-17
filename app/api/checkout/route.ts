import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { calculateCouponDiscount, calculateOrderTotals } from "@/lib/order-math";
import { generateOrderNumber } from "@/lib/utils";
import { getSiteSettings } from "@/lib/settings";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  for (const item of cartItems) {
    if (item.product.status !== "ACTIVE" || item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `${item.product.name} does not have enough stock available` },
        { status: 400 }
      );
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
    0
  );

  let discount = 0;
  let couponId: string | null = null;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode.toUpperCase().trim() } });
    const now = new Date();
    if (
      coupon &&
      coupon.status === "ACTIVE" &&
      now >= coupon.startDate &&
      now <= coupon.expiryDate &&
      subtotal >= coupon.minOrderAmount &&
      (coupon.usageLimit === 0 || coupon.usedCount < coupon.usageLimit)
    ) {
      discount = calculateCouponDiscount({
        subtotal,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
      });
      couponId = coupon.id;
    }
  }

  const settings = await getSiteSettings();
  const { deliveryCharge, tax, grandTotal } = calculateOrderTotals({
    subtotal,
    deliveryChargeFlat: settings.deliveryChargeFlat,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    taxPercent: settings.taxPercent,
    discount,
  });

  let addressId: string | null = null;
  let addressSnapshot = "";

  if (data.addressId) {
    const address = await prisma.address.findUnique({ where: { id: data.addressId } });
    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid delivery address" }, { status: 400 });
    }
    addressId = address.id;
    addressSnapshot = `${address.fullName}, ${address.line1}${address.line2 ? ", " + address.line2 : ""}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`;
  } else if (data.newAddress) {
    const address = await prisma.address.create({
      data: { ...data.newAddress, userId: session.user.id },
    });
    addressId = address.id;
    addressSnapshot = `${address.fullName}, ${address.line1}${address.line2 ? ", " + address.line2 : ""}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`;
  } else {
    return NextResponse.json({ error: "Please provide a delivery address" }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();
  const paymentStatus = data.paymentMethod === "COD" ? "PENDING" : "PAID";

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        addressId,
        addressSnapshot,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        status: "PLACED",
        paymentStatus,
        paymentMethod: data.paymentMethod,
        subtotal,
        deliveryCharge,
        discount,
        tax,
        grandTotal,
        couponId,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            unit: item.product.unit,
            image: item.product.images[0]?.url ?? "",
            price: item.product.discountPrice ?? item.product.price,
            quantity: item.quantity,
            lineTotal: (item.product.discountPrice ?? item.product.price) * item.quantity,
          })),
        },
        statusHistory: {
          create: [{ status: "PLACED", note: "Order placed by customer" }],
        },
      },
    });

    for (const item of cartItems) {
      const newStock = Math.max(item.product.stock - item.quantity, 0);
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: newStock,
          availability: newStock === 0 ? "OUT_OF_STOCK" : "IN_STOCK",
        },
      });
    }

    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    }

    await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

    return created;
  });

  await prisma.notification.create({
    data: {
      userId: session.user.id,
      audience: "CUSTOMER",
      title: "Order placed successfully",
      message: `Your order ${order.orderNumber} has been placed and is being processed.`,
      type: NOTIFICATION_TYPES.ORDER_PLACED,
    },
  });

  await prisma.notification.create({
    data: {
      audience: "ADMIN",
      title: "New order received",
      message: `Order ${order.orderNumber} placed by ${data.customerName} for ₹${grandTotal}.`,
      type: NOTIFICATION_TYPES.NEW_ORDER,
    },
  });

  const lowStockProducts = await prisma.product.findMany({
    where: { id: { in: cartItems.map((i) => i.productId) }, stock: { lte: settings.lowStockThreshold } },
  });
  for (const p of lowStockProducts) {
    await prisma.notification.create({
      data: {
        audience: "ADMIN",
        title: "Low stock alert",
        message: `${p.name} is running low on stock (${p.stock} ${p.unit} left).`,
        type: NOTIFICATION_TYPES.LOW_STOCK,
      },
    });
  }

  return NextResponse.json({ orderNumber: order.orderNumber, grandTotal: order.grandTotal });
}
