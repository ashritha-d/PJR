import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const content = await prisma.homepageContent.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ content });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const content = await prisma.homepageContent.upsert({
    where: { id: "singleton" },
    update: {
      heroHeading: body.heroHeading,
      heroSubheading: body.heroSubheading,
      heroImage: body.heroImage,
      heroButtons: JSON.stringify(body.heroButtons ?? []),
      whyChooseUs: JSON.stringify(body.whyChooseUs ?? []),
      testimonials: JSON.stringify(body.testimonials ?? []),
    },
    create: {
      id: "singleton",
      heroHeading: body.heroHeading,
      heroSubheading: body.heroSubheading,
      heroImage: body.heroImage,
      heroButtons: JSON.stringify(body.heroButtons ?? []),
      whyChooseUs: JSON.stringify(body.whyChooseUs ?? []),
      testimonials: JSON.stringify(body.testimonials ?? []),
    },
  });

  return NextResponse.json({ content });
}
