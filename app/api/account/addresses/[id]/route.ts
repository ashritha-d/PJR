import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations";

async function assertOwnership(userId: string, addressId: string) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  return address && address.userId === userId ? address : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  const body = await req.json();
  const parsed = addressSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ address });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
