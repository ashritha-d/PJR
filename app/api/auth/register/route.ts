import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, phone, email, password, address } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email: normalizedEmail,
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
      addresses: {
        create: {
          label: "Home",
          fullName: name,
          phone,
          line1: address,
          city: "",
          state: "",
          pincode: "",
          isDefault: true,
        },
      },
    },
  });

  await prisma.notification.create({
    data: {
      audience: "ADMIN",
      title: "New customer registered",
      message: `${user.name} (${user.email}) just created an account.`,
      type: "NEW_CUSTOMER",
    },
  });

  return NextResponse.json({ success: true });
}
