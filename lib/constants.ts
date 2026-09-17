// Central source of truth for the "enum-like" string fields stored in SQLite
// (Prisma has no native enum support on SQLite — see prisma/schema.prisma).

export const ROLES = ["CUSTOMER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ACCOUNT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const AVAILABILITY = ["IN_STOCK", "OUT_OF_STOCK"] as const;

export const REVIEW_STATUSES = ["PENDING", "APPROVED", "HIDDEN"] as const;

export const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export const PAYMENT_METHODS = ["COD", "UPI", "ONLINE"] as const;
export const DISCOUNT_TYPES = ["PERCENT", "FLAT"] as const;
export const COUPON_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const BANNER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "CLOSED"] as const;

export const FARM_SECTION_KEYS = [
  "crop-cultivation",
  "dairy-farming",
  "fresh-vegetables",
  "pisciculture",
  "poultry-farming",
  "livestock-rearing",
] as const;

export const NOTIFICATION_TYPES = {
  ORDER_PLACED: "ORDER_PLACED",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_SHIPPED: "ORDER_SHIPPED",
  ORDER_DELIVERED: "ORDER_DELIVERED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  OFFER: "OFFER",
  NEW_ORDER: "NEW_ORDER",
  LOW_STOCK: "LOW_STOCK",
  NEW_CUSTOMER: "NEW_CUSTOMER",
  NEW_REVIEW: "NEW_REVIEW",
  NEW_MESSAGE: "NEW_MESSAGE",
} as const;
