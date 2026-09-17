import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();

  return NextResponse.json({
    businessName: settings.businessName,
    tagline: settings.tagline,
    deliveryChargeFlat: settings.deliveryChargeFlat,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    taxPercent: settings.taxPercent,
    currency: settings.currency,
  });
}
