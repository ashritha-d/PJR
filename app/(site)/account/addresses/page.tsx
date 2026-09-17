import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressManager } from "@/components/site/AddressManager";

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="section-heading">Saved Addresses</h1>
      <p className="section-subheading">Manage your delivery addresses for faster checkout.</p>
      <div className="mt-8">
        <AddressManager initial={addresses} />
      </div>
    </div>
  );
}
