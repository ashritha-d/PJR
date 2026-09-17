import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { generateResetToken } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond generically to avoid leaking which emails are registered.
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // No email provider is configured yet (see .env.example EMAIL_SERVER / EMAIL_FROM).
  // Until one is wired up, we hand the reset link back directly so the flow is testable end-to-end.
  const resetUrl = `/reset-password/${token}`;

  return NextResponse.json({ success: true, devResetUrl: resetUrl });
}
