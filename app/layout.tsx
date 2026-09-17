import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "PJR Farm & Agro Products | Nourishing Nature, Enriching Lives.",
    template: "%s | PJR Farm & Agro Products",
  },
  description:
    "PJR Farm & Agro Products is an integrated farming enterprise established in 2017, delivering wholesome, naturally grown crops, dairy, vegetables, fish, poultry and livestock products from farm to family.",
  icons: {
    icon: "/brand/logo-emblem.jpg",
  },
  openGraph: {
    title: "PJR Farm & Agro Products",
    description: "Nourishing Nature, Enriching Lives.",
    images: ["/brand/logo-stacked.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
