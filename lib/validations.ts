import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    address: z.string().trim().min(5, "Address is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  label: z.string().trim().min(1).default("Home"),
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  line1: z.string().trim().min(5, "Address line is required"),
  line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  subject: z.string().trim().min(3, "Subject is required"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(5, "Please write a short review"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategory: z.string().trim().optional().nullable(),
  description: z.string().trim().min(10, "Description is required"),
  farmSource: z.string().trim().optional().nullable(),
  storageInstructions: z.string().trim().optional().nullable(),
  deliveryInfo: z.string().trim().optional().nullable(),
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().nonnegative().nullable().optional(),
  sku: z.string().trim().min(2, "SKU is required"),
  stock: z.number().int().nonnegative(),
  unit: z.string().trim().min(1, "Unit is required"),
  weight: z.string().trim().optional().nullable(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  images: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  description: z.string().trim().min(5, "Description is required"),
  image: z.string().trim().min(1, "Image is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  displayOrder: z.number().int().optional(),
});

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Coupon code is required")
      .transform((v) => v.toUpperCase()),
    discountType: z.enum(["PERCENT", "FLAT"]),
    discountValue: z.number().positive("Discount value must be greater than 0"),
    minOrderAmount: z.number().nonnegative().default(0),
    maxDiscount: z.number().positive().nullable().optional(),
    startDate: z.string().min(1),
    expiryDate: z.string().min(1),
    usageLimit: z.number().int().nonnegative().default(0),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((data) => new Date(data.expiryDate) > new Date(data.startDate), {
    message: "Expiry date must be after start date",
    path: ["expiryDate"],
  });

export const bannerSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  subtitle: z.string().trim().optional().nullable(),
  image: z.string().trim().min(1, "Image is required"),
  buttonText: z.string().trim().optional().nullable(),
  buttonLink: z.string().trim().optional().nullable(),
  displayOrder: z.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const farmSectionSchema = z.object({
  key: z.string().trim().min(2),
  title: z.string().trim().min(2, "Title is required"),
  description: z.string().trim().min(5, "Description is required"),
  image: z.string().trim().min(1, "Image is required"),
  displayOrder: z.number().int().optional(),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2),
  tagline: z.string().trim().min(2),
  logoUrl: z.string().trim().min(1),
  faviconUrl: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  whatsapp: z.string().trim().min(5),
  email: z.string().trim().email(),
  address: z.string().trim().min(5),
  workingHours: z.string().trim().min(2),
  mapEmbedUrl: z.string().trim().optional().default(""),
  socialLinks: z.object({
    facebook: z.string().trim().optional().default(""),
    instagram: z.string().trim().optional().default(""),
    youtube: z.string().trim().optional().default(""),
    twitter: z.string().trim().optional().default(""),
  }),
  deliveryChargeFlat: z.number().nonnegative(),
  freeDeliveryThreshold: z.number().nonnegative(),
  taxPercent: z.number().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  currency: z.string().trim().min(1),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Name is required"),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  addressId: z.string().min(1).optional(),
  newAddress: addressSchema.optional(),
  paymentMethod: z.enum(["COD", "UPI", "ONLINE"]),
  couponCode: z.string().trim().optional().nullable(),
});
