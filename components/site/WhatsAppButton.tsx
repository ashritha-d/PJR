import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  const digits = whatsapp.replace(/[^\d]/g, "");
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:scale-105"
    >
      <MessageCircle size={28} fill="white" className="text-[#25D366]" />
    </a>
  );
}
