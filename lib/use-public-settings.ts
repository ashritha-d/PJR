"use client";

import { useEffect, useState } from "react";

export type PublicSettings = {
  businessName: string;
  tagline: string;
  deliveryChargeFlat: number;
  freeDeliveryThreshold: number;
  taxPercent: number;
  currency: string;
};

const DEFAULTS: PublicSettings = {
  businessName: "PJR Farm & Agro Products",
  tagline: "Nourishing Nature, Enriching Lives.",
  deliveryChargeFlat: 40,
  freeDeliveryThreshold: 999,
  taxPercent: 0,
  currency: "INR",
};

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/settings/public")
      .then((res) => res.json())
      .then((data) => {
        if (active) setSettings(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
