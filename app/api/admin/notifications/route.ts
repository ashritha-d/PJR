import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { audience: "ADMIN" },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { audience: "ADMIN", isRead: false } }),
  ]);

  return NextResponse.json({ items, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const { id, markAllRead } = (await req.json()) as { id?: string; markAllRead?: boolean };

  if (markAllRead) {
    await prisma.notification.updateMany({ where: { audience: "ADMIN", isRead: false }, data: { isRead: true } });
    return NextResponse.json({ success: true });
  }

  if (id) {
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
