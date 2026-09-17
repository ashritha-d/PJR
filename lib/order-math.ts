export function calculateOrderTotals({
  subtotal,
  deliveryChargeFlat,
  freeDeliveryThreshold,
  taxPercent,
  discount = 0,
}: {
  subtotal: number;
  deliveryChargeFlat: number;
  freeDeliveryThreshold: number;
  taxPercent: number;
  discount?: number;
}) {
  const deliveryCharge = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : deliveryChargeFlat;
  const taxableAmount = Math.max(subtotal - discount, 0);
  const tax = Math.round((taxableAmount * taxPercent) / 100);
  const grandTotal = Math.max(subtotal - discount + deliveryCharge + tax, 0);

  return { deliveryCharge, tax, grandTotal };
}

export function calculateCouponDiscount({
  subtotal,
  discountType,
  discountValue,
  maxDiscount,
}: {
  subtotal: number;
  discountType: string;
  discountValue: number;
  maxDiscount?: number | null;
}) {
  let discount = discountType === "PERCENT" ? (subtotal * discountValue) / 100 : discountValue;
  if (maxDiscount != null) discount = Math.min(discount, maxDiscount);
  return Math.min(Math.round(discount), subtotal);
}
