"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function ConditionalFooter(props: React.ComponentProps<typeof Footer>) {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return <Footer {...props} />;
}
