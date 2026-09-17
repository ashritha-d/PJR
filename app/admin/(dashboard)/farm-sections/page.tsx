import { prisma } from "@/lib/prisma";
import { FarmSectionsClient } from "./farm-sections-client";

export const dynamic = "force-dynamic";

export default async function AdminFarmSectionsPage() {
  const sections = await prisma.farmSection.findMany({ orderBy: { displayOrder: "asc" } });
  return <FarmSectionsClient initial={sections} />;
}
