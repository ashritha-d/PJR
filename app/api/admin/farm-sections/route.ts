import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { farmSectionSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sections = await prisma.farmSection.findMany({ orderBy: { displayOrder: "asc" } });
  return NextResponse.json({ items: sections });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = farmSectionSchema.safeParse({ ...body, key: body.key || slugify(body.title ?? "") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const maxOrder = await prisma.farmSection.aggregate({ _max: { displayOrder: true } });
  const section = await prisma.farmSection.create({
    data: { ...parsed.data, displayOrder: parsed.data.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1 },
  });

  return NextResponse.json({ section });
}
