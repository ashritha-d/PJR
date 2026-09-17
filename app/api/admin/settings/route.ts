import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { settingsSchema } from "@/lib/validations";
import { DEFAULT_SETTINGS } from "@/lib/settings";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = (await prisma.siteSettings.findUnique({ where: { id: "singleton" } })) ?? DEFAULT_SETTINGS;

  return NextResponse.json({
    settings: {
      businessName: settings.businessName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      address: settings.address,
      workingHours: settings.workingHours,
      mapEmbedUrl: settings.mapEmbedUrl,
      socialLinks: JSON.parse(settings.socialLinks),
      deliveryChargeFlat: settings.deliveryChargeFlat,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      taxPercent: settings.taxPercent,
      lowStockThreshold: settings.lowStockThreshold,
      currency: settings.currency,
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { socialLinks, ...rest } = parsed.data;

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { ...rest, socialLinks: JSON.stringify(socialLinks) },
    create: { id: "singleton", ...rest, socialLinks: JSON.stringify(socialLinks) },
  });

  return NextResponse.json({ settings });
}
