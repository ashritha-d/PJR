import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings";
import { ContactForm } from "@/components/site/ContactForm";
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with PJR Farm & Agro Products — call, WhatsApp, or send us a message.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const whatsappDigits = settings.whatsapp.replace(/[^\d]/g, "");
  const phoneDigits = settings.phone.replace(/[^\d+]/g, "");

  return (
    <div className="container-page py-10">
      <div className="mb-10 text-center">
        <h1 className="section-heading">Contact Us</h1>
        <p className="section-subheading mx-auto">
          Have a question about our products or an order? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="card space-y-5 p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0 text-forest-600" size={20} />
              <div>
                <p className="text-sm font-semibold text-forest-800">Business Address</p>
                <p className="text-sm text-forest-500">{settings.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 shrink-0 text-forest-600" size={20} />
              <div>
                <p className="text-sm font-semibold text-forest-800">Phone</p>
                <p className="text-sm text-forest-500">{settings.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 shrink-0 text-forest-600" size={20} />
              <div>
                <p className="text-sm font-semibold text-forest-800">Email</p>
                <p className="text-sm text-forest-500">{settings.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 shrink-0 text-forest-600" size={20} />
              <div>
                <p className="text-sm font-semibold text-forest-800">Working Hours</p>
                <p className="text-sm text-forest-500">{settings.workingHours}</p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-forest-100 pt-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-forest-50 p-3 text-center text-xs font-semibold text-forest-700 hover:bg-forest-100"
              >
                <MessageCircle size={20} /> WhatsApp
              </a>
              <a
                href={`tel:${phoneDigits}`}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-forest-50 p-3 text-center text-xs font-semibold text-forest-700 hover:bg-forest-100"
              >
                <Phone size={20} /> Call Now
              </a>
              <a
                href={
                  settings.mapEmbedUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-forest-50 p-3 text-center text-xs font-semibold text-forest-700 hover:bg-forest-100"
              >
                <Navigation size={20} /> Directions
              </a>
            </div>
          </div>

          {settings.mapEmbedUrl ? (
            <div className="card overflow-hidden">
              <iframe
                src={settings.mapEmbedUrl}
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                title="PJR Farm location map"
              />
            </div>
          ) : (
            <div className="card flex h-48 items-center justify-center p-6 text-center text-sm text-forest-400">
              Map location will appear here once configured from Admin Settings.
            </div>
          )}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
