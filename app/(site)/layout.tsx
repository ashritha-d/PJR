import { prisma } from "@/lib/prisma";
import { getSiteSettings, parseSocialLinks } from "@/lib/settings";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      where: { status: "ACTIVE" },
      orderBy: { displayOrder: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  const socialLinks = parseSocialLinks(settings.socialLinks);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar businessName={settings.businessName} categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer
        businessName={settings.businessName}
        tagline={settings.tagline}
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        categories={categories}
        socialLinks={socialLinks}
      />
      <WhatsAppButton whatsapp={settings.whatsapp} />
    </div>
  );
}
