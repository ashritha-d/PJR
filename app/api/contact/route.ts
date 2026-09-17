import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await prisma.contactMessage.create({ data: parsed.data });

  await prisma.notification.create({
    data: {
      audience: "ADMIN",
      title: "New contact message",
      message: `${parsed.data.name} sent a message: "${parsed.data.subject}"`,
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
    },
  });

  return NextResponse.json({ success: true });
}
