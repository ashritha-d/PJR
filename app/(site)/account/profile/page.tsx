import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/site/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <div>
      <h1 className="section-heading">My Profile</h1>
      <p className="section-subheading">Manage your personal information.</p>
      <div className="mt-8">
        <ProfileForm initial={user!} />
      </div>
    </div>
  );
}
