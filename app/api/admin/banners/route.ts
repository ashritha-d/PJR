import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { bannerSchema } from "@/lib/validations";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const banners = await prisma.banner.findMany({ orderBy: { displayOrder: "asc" } });
  return NextResponse.json({ items: banners });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const maxOrder = await prisma.banner.aggregate({ _max: { displayOrder: true } });
  const banner = await prisma.banner.create({
    data: { ...parsed.data, displayOrder: parsed.data.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1 },
  });

  return NextResponse.json({ banner });
}
