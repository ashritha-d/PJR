import { prisma } from "@/lib/prisma";
import { BannersClient } from "./banners-client";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { displayOrder: "asc" } });
  return <BannersClient initial={banners} />;
}
