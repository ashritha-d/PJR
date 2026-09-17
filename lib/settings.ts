import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS = {
  id: "singleton",
  businessName: "PJR Farm & Agro Products",
  tagline: "Nourishing Nature, Enriching Lives.",
  logoUrl: "/brand/logo-horizontal.jpg",
  faviconUrl: "/brand/logo-emblem.jpg",
  phone: "+91 90000 00000",
  whatsapp: "+91 90000 00000",
  email: "info@pjrfarm.example",
  address: "PJR Farm & Agro Products, Bibigudem Village, Suryapet District, Telangana, India",
  workingHours: "Mon – Sat: 7:00 AM – 8:00 PM",
  mapEmbedUrl: "",
  socialLinks: JSON.stringify({ facebook: "", instagram: "", youtube: "", twitter: "" }),
  deliveryChargeFlat: 40,
  freeDeliveryThreshold: 999,
  taxPercent: 0,
  lowStockThreshold: 10,
  currency: "INR",
  updatedAt: new Date(),
};

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return settings ?? DEFAULT_SETTINGS;
}

export function parseSocialLinks(json: string) {
  try {
    return JSON.parse(json) as {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      twitter?: string;
    };
  } catch {
    return {};
  }
}
